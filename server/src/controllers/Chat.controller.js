import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {Chat} from '../models/chat.model.js'
import { emitEvent } from "../utils/socket.js";
import { ALERT, NEW_ATTACHEMENTS, NEW_MESSAGE, NEW_MESSAGE_ALERT, REFETCH_CHATS } from "../../constants/constants.js";
import { User } from "../models/User.model.js";
import { Message } from "../models/message.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { NEW_ATTACHEMENTS_ALERT } from "../../../client/src/constants/constants.js";


const newGroupChat = asyncHandler( async(req , res)=>{

    const {name , members} = req.body;
    const userId = req.user?._id;

    if(members.length<2){
        throw new ApiError(400 , "Group chat must have atleast 3 members");
    }

    const allMembers = [...members, userId.toString()];

    const chat = await Chat.create({
        name,
        members : allMembers,
        groupChat : true,
        creator : userId
    });

    if(!chat){
        throw new ApiError(500 , "Error creating a group ");
    };

    emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
    emitEvent(req, REFETCH_CHATS,members);

    return res
    .status(200)
    .json(new ApiResponse(200 , "Group created successfully"));

});

const getMyChats = asyncHandler( async(req, res)=>{

    const userId = req.user?._id;

    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(404 , "No such user found");
    }

    // const chats = await Chat.aggregate([
    //     {
    //         $match : {
    //             $or : [
    //                 {creator : userId},
    //                 {members : {$in : [userId]}}
    //             ] 
    //         }
    //     },
    //     {
    //         $lookup : {
    //             from : "users",
    //             foreignField : "_id",
    //             localField : "creator",
    //             as : "creator",
    //             pipeline : [
    //                 {
    //                     $project : {
    //                         fullName : 1,
    //                         username : 1,
    //                         avatar : 1
    //                     }
    //                 }
    //             ]
    //         }
    //     },
    //     {
    //         $lookup : {
    //             from : "users",
    //             localField : "members",
    //             foreignField : "_id",
    //             as : "members",
    //             pipeline : [
    //                 {
    //                     $project : {
    //                         fullName : 1,
    //                         username : 1,
    //                         avatar : 1
    //                     }
    //                 }
    //             ]
    //         }
    //     }
    // ]);


    const chats = await Chat.find({
        members : {$in : [userId.toString()]}
    })
    .populate({
        path : 'creator',
        select : "fullName username  avatar"
    })
    .populate({
        path : 'members',
        select : "fullName username  avatar"
    });
    

    return res
    .status(200)
    .json(new ApiResponse(200 , chats , "Chats fethed sucessfully"));

});

const addMemebers = asyncHandler( async(req, res)=>{

    const userId = req.user?._id;
    const {memberIds, chatId} = req.body;

    const chat = await Chat.findById(chatId);
     if(!chat){
        throw new ApiError(404, "No such chat found");
    } 
    if(!(chat.groupChat)){
        throw new ApiError(400, "This is not a group chat")
    }
    
    if(chat.creator.toString() !== userId.toString()){
        throw new ApiError(403 , "Only the grp leader can add a member" )
    }

    await Promise.all(memberIds.map(async(member)=> {
        const mem =  await User.findById(member);
        if(!mem){
            throw new ApiError(404, "Some or all users do not exists");
        }
        if((chat.members).includes(mem)){
            throw new ApiError(409, "Some or all users already exists in this grp")
        }
    }))


    chat.members.push(...memberIds);
    await chat.save({validateBeforeSave : false});

    emitEvent(req, ALERT, chat.members, `New member(s) has been added to this grp`);

    emitEvent(req, REFETCH_CHATS, chat.members);
    
    return res
    .status(200)
    .json(new ApiResponse(200,"New member added successfully"));

});

const deleteMember = asyncHandler( async(req, res)=>{
    
    const userId = req.user?._id;
    const {memberId, chatId} = req.body;

    const mem = await User.findById(memberId);
    if(!mem){
        throw new ApiError(404, "No such user found");
    } 
    const chat = await Chat.findById(chatId);
     if(!chat){
        throw new ApiError(404, "No such chat found");
    } 
    if(!(chat.groupChat)){
        throw new ApiError(400, "This is not a group chat")
    }

    if(!((chat.members).includes(memberId))){
        throw new ApiError(403, "User does not exists in this grp")
    }

     if(chat.creator.toString() !== userId.toString()){
        throw new ApiError(403 , "Only the grp leader can remove a member" )
    };

    if(!(chat.members.length >3)){
        throw new ApiError(403, "Group must contain atleast 3 members")
    }

    const updatedMembers = chat.members.filter((member)=>  member.toString() !== memberId );
    chat.members = updatedMembers
    await chat.save({validateBeforeSave : false});

    emitEvent(req, ALERT, chat.members, `${mem.fullName} has been removed from this grp`);
    emitEvent(req, REFETCH_CHATS, chat.members)

    return res
    .status(200)
    .json(new ApiResponse(200, updatedMembers, "Member deleted successfully"));

});

const sendAttachment = asyncHandler( async(req, res)=>{


    const {chatId, content} = req.body;

    const userId = req.user._id;

    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(404, "No such user");
    }

    const chat = await  Chat.findById(chatId).populate("members", "fullName username avatar");
    if(!chat){
        throw new ApiError(404, "No such chat found")
    };

    const files = req.files;

    if(!files || files.length==0){
        throw new ApiError(400, "No files found");
    };

    const attachements = []

    try {
        await Promise.all(
        files.map(async (file)=>{

        const res = await uploadOnCloudinary(file.path);

        if(!res){
            throw new ApiError(500, "Something went wrong while uploading the files to cloudinary")
        }
        attachements.push(res.url);
    }))
    } catch (error) {
        throw new ApiError(500, error)
    }

    const messageForDb = {
        content : content,
        sender : userId,
        attachements ,
        chat : chatId
    };

    const messageForRealTime = {
        ...messageForDb, 
        sender : {
            id : userId,
            name : user.fullName,
            avatar : user.avatar
        },
        createdAt : new Date().toISOString()
    }
    const message = await Message.create(messageForDb);

    emitEvent(req, NEW_ATTACHEMENTS, chat.members, {
        message : messageForRealTime,
        chatId
    });
    emitEvent(req, NEW_ATTACHEMENTS_ALERT, chat.members, chatId);

    return res
    .status(200)
    .json(new ApiResponse(200, message,  "Files sent successfully"));
});

const getChatDetails = asyncHandler( async(req, res)=>{

    const {id} = req.params;
    const userId = req.user?._id;

    const chat = await Chat.findById(id).populate("members", "fullName username avatar email");
    if(!chat){
        throw new ApiError(404, "No such chat found");
    }

    if(chat.groupChat){
        const info = {
            name : chat.name,
            members : chat.members,
            createdAt : chat.createdAt,
            creator : chat.creator
        }
        return res
        .status(200)
        .json(new ApiResponse(200, info, "Chat info fetched successfully"));
    }else{
        const members = chat.members;
        const otherMem = members.filter((mem)=> mem._id.toString() != userId.toString());
        const info = {
            name : otherMem[0].fullName,
            username : otherMem[0].username,
            avatar : otherMem[0].avatar,
            email : otherMem[0].email,
            createdAt : chat.createdAt
        }
    return res
    .status(200)
    .json(new ApiResponse(200, info, "Chat details fetched successfully"));
    }
});

const deleteChat = asyncHandler( async(req, res)=>{

    const {id} = req.params;
    const userId = req.user?._id;
 
    const chat  = await Chat.findById(id);
    if(!chat){
        throw new ApiError(404, "No such chat found")
    };

    const members = chat.members;

    if(chat.creator && chat.creator.toString() !== userId.toString()){
        throw new ApiError(403, "Only the chat creator can delete a grp");
    }
 
    await chat.deleteOne();
    await Message.deleteMany({chat : id})

    emitEvent(req, REFETCH_CHATS, members);

    return res
    .status(200)
    .json(new ApiResponse(200, "Chat and messagges deleted successfully"));

});

const getMessages = asyncHandler( async(req, res)=>{
    const {chatId} = req.params;
    const {page=1} = req.query;

    const chat = await Chat.findById(chatId);
    if(!chat){
        throw new ApiError(404, "No such chat found");
    }
    const limit = 20;
    const skip = (page-1)*limit;

    const totalMessages = await Message.countDocuments({chat : chatId});
    
    const messages = await Message.find({chat : chatId})
    .sort({createdAt : -1}) 
    .skip(skip)
    .limit(limit)
    .populate("sender", "fullName avatar")
    .lean();

    const totalPages = Math.ceil((totalMessages/limit));
    
    return res
    .status(200)
    .json(new ApiResponse(200, {messages : messages, message_count : totalMessages, pages : totalPages}, "Messages fetched successfully"));
});







export {
    newGroupChat,
    getMyChats,
    addMemebers,
    deleteMember,
    sendAttachment,
    getChatDetails,
    deleteChat,
    getMessages
}
