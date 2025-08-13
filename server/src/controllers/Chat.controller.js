import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {Chat} from '../models/chat.model.js'
import { emitEvent } from "../utils/socket.js";
import { ALERT, NEW_ATTACHEMENTS, NEW_MESSAGE, NEW_MESSAGE_ALERT, REFETCH_CHATS } from "../../constants/constants.js";
import { User } from "../models/User.model.js";
import { Message } from "../models/message.model.js";



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







export {
    getMyChats,
    getChatDetails,
    deleteChat,
}
