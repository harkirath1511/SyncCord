import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import {Request} from '../models/request.model.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { Chat } from '../models/chat.model.js'
import { emitEvent } from '../utils/socket.js'
import { NEW_REQUEST, REFETCH_CHATS } from '../../constants/constants.js'


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

    
    if(alreadyFrnd){
        throw new ApiError(409, "Already a freind")
    }

    const request = await Request.create({
        sender : userId,
        receiver : secUserId,
    });

    emitEvent(req, NEW_REQUEST, [secUserId], "request")

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


export {
    sendRequest,
    acceptOrRejectReq,
    getMyRequests
}
