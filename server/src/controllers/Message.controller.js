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
        const chatMems = chat.members.map((mem)=> mem._id);

    emitEvent(req, NEW_ATTACHEMENTS, chatMems, {
        message : messageForRealTime,
        chatId
    });
    emitEvent(req, NEW_ATTACHEMENTS_ALERT, chatMems, chatId);

    return res
    .status(200)
    .json(new ApiResponse(200, message,  "Files sent successfully"));
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
    sendAttachment,
    getMessages
}
