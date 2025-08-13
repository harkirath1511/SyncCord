import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import {Request} from '../models/request.model.js'
import { uploadOnCloudinary } from '../services/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { Chat } from '../models/chat.model.js'
import { emitEvent } from '../utils/socket.js'
import { NEW_REQUEST, REFETCH_CHATS } from '../../constants/constants.js'


const registerUser = asyncHandler(async (req, res) => {


    const {username , email , fullName, password} = req.body;
    if ([fullName , email , password , username].some((field) =>
            field?.trim() === "") ){
        throw new ApiError(400 , "All fields are required");
    }


    const existedUser = await User.findOne({
        $or : [{email}, {username}]
    });
    if(existedUser){
        throw new ApiError(409 , "User already exists");
    }

    let avatarLocalPath;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        avatarLocalPath = req.files?.avatar[0]?.path;
   }
    let imgLocalPath;
    if(req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.length > 0){
         imgLocalPath = req.files?.coverImg[0]?.path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is required");
    }
    const avatar =  await uploadOnCloudinary(avatarLocalPath);
    const coverImg = await uploadOnCloudinary(imgLocalPath);
    if(!avatar){
        return new ApiError(500, "Something went wrong while uploading this image");
    }


    const user = await User.create({
        fullName,
        avatar : avatar?.url,
        coverImage : coverImg?.url || "",
        email ,
        password,
        username : username.toLowerCase()
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating the user");
    }


   res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
   );


});

const generateTokens = async(userId) =>{
    try{
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        return { accessToken }

    }catch(err){
        throw new ApiError(500 , "Something went wrong while generating tokens");
    }
}

const loginUser = asyncHandler(async (req, res)=>{

    const {email, username , password} = req.body;

    if(!username && !email){
        throw new ApiError(400, "Username or email is required");
    };

    const user = await User.findOne({
        $or : [{email}, {username}]
    });
    if(!user){
        throw new ApiError(404, "User does not exists");
    }
    
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Inavlid user credentials");
    }

    const {accessToken} = await generateTokens(user._id);
 

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : false, // Set to false for development (HTTP)
        sameSite: 'lax'
    }

    return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .json(new ApiResponse(200, {
            user : loggedInUser, accessToken 
            }, 
            "user logged-in successfully"
    ))

});

const logoutUser = asyncHandler(async (req, res)=>{

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(
        new ApiResponse(200, {}, "User logged-out successfully")
    )

});

const changeUserPassword = asyncHandler(async (req, res)=>{

    const { oldPassword , newPassword} = req.body;

    const userId = req.user?._id;
    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(400, "User does not exists");
    }

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

   if(!isPasswordCorrect){
        throw new ApiError(401, "Incorrect Password")
   }
   user.password = newPassword;

   await user.save({validateBeforeSave : false});

   return res
   .status(200)
   .json(
    new ApiResponse(200,{}, "User password updated successfully")
   );
    
});

const getUserInfo = asyncHandler(async (req, res)=>{
    const user = req.user;
    
    res
    .status(200)
    .json(new ApiResponse(200, {user : user}, "User details fetched successfully"));
});

const updateUserDetails = asyncHandler( async(req, res)=>{

    const {fullName, username} = req.body;

    if(!fullName || !username){
        throw new ApiError(400, "Fullname or username is required");
    }

    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(400, "No such user exists");
    }
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set : {
                fullName : fullName,
                username : username
            }
        },
        {new : true}
    ).select("-password");

    res
    .status(200)
    .json(
        new ApiResponse(200, user, "User details updated successfully")
    );

    

});

const updateImgs = asyncHandler( async(req, res)=>{

    const userId = req.user?._id;
    const avatarLocalPath = req.files?.avatar[0].path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(500, "Something went wrong while uploading file");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set : {
                avatar : avatar.url
            },
        },
        {new : true}
    ).select("-password");

    res
    .status(200)
    .json(
        new ApiResponse(200, user, "User avatar updated successfully")
    );


});

const sendRequest = asyncHandler( async(req, res)=>{

    const userId = req.user?._id;
    const {secUserId} = req.body;

    const secUser = await User.findById(secUserId);

    if(!secUser){
        throw new ApiError(404, "The provided user does not exists");
    };

    if(secUserId.toString() == userId.toString()){
        throw new ApiError(409, "You cannot send a req to yourself");
    }

    const duplicateReq = await Request.findOne({
        $or : [
            {sender : userId, receiver : secUserId},
            {sender : secUser, receiver : userId}
        ]
    });

    if(duplicateReq){
        throw new ApiError(409, "Request already sent ");
    };

    const alreadyFrnd = await Chat.findOne({
        groupChat : false,
        members : secUser
    });
    console.log(alreadyFrnd);
    if(alreadyFrnd){
        throw new ApiError(409, "Already a freind")
    }

    const request = await Request.create({
        sender : userId,
        receiver : secUserId,
    });

    emitEvent(req, NEW_REQUEST, secUserId, "request")

    if(!request){
        throw new ApiError(500, 'Something went wrong while creating a request')
    }

    return res
    .status(200)
    .json(new ApiResponse(200, request, "Request sent successfully"));

});

const acceptOrRejectReq = asyncHandler( async(req, res)=>{

    const userId = req.user?._id;
    const user = await User.findById(userId);

    const {reqId, accept} = req.body;

    const request = await Request.findById(reqId).populate("receiver", "fullName avatar username").populate("sender", "fullName avatar")

    if(!request){
        throw new ApiError(404, "Request cancelled or not found");
    }

    if(request.status === "accepted" || request.status === "rejected"){
        throw new ApiError(409, "Request already accepted or rejected");
    }


    if(!(request.receiver._id.toString() === userId.toString())){
        throw new ApiError(401, "You are not allowed to accept or reject this req")
    }

    if(!accept){
       await request.deleteOne();
       return res
       .status(200)
       .json(new ApiResponse(200, "Request declined successfully"));
    }

    const chat = await  Chat.create({
        name : `${request.sender.fullName}-${user.fullName}`,
        members : [userId, request.sender._id],
        avatar : request.sender.avatar
    });

    if(!chat){
        throw  new ApiError(500, "SometHing went wrong while creating a chat");
    }

    emitEvent(req, REFETCH_CHATS, [userId, request.receiver._id]);

    await request.deleteOne();

    return res
    .status(200)
    .json(new ApiResponse(200, request, "Request accepted successfully"));
});

const getMyRequests = asyncHandler( async(req, res)=>{

    const userId = req.user?._id;

    const requests = await Request.find({
        receiver : userId
    }).populate("sender" , "fullName avatar username")

    return res
    .status(200)
    .json(new ApiResponse(200, requests, "User requests fetched successfully"));
});

const getMyFriends = asyncHandler(async(req, res) => {
    const userId = req.user?._id;

    const personalChats = await Chat.find({
        groupChat: false,
        members: userId
    }).select("members").populate("members", "fullName avatar username");

    let friends = [];
    personalChats.forEach(chat => {
        chat.members.forEach(member => {
            if (member._id.toString() !== userId.toString()) {
                friends.push(member); 
            }
        });
    });

    const uniqueFriends = [];
    const seen = new Set();
    friends.forEach(friend => {
        if (!seen.has(friend._id.toString())) {
            uniqueFriends.push(friend);
            seen.add(friend._id.toString());
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, uniqueFriends, "Friends list fetched successfully"));
});

const getAllGrps = asyncHandler( async(req, res)=>{

    const userId = req.user?._id;

    const grps = await Chat.find({
        "members.2" : { $exists : true},
        'members' : userId
    });

    console.log(grps);

    return res
    .status(200)
    .json(new ApiResponse(200, grps, "Fetched all grps successfully"));
});

const getAllUsers = asyncHandler( async(req, res)=>{

    const users = await User.find().select("fullName avatar username");

    return res
    .status(200)
    .json(new ApiResponse(200, users, "all users fetched successfully"));
});










export{
    registerUser,
    loginUser,
    logoutUser,
    changeUserPassword,
    getUserInfo,
    updateUserDetails,
    updateImgs,
    sendRequest,
    acceptOrRejectReq,
    getMyRequests,
    getMyFriends,
    getAllGrps,
    getAllUsers
}
