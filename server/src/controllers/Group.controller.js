import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import {Request} from '../models/request.model.js'
import { uploadOnCloudinary } from '../services/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { Chat } from '../models/chat.model.js'
import { emitEvent } from '../utils/socket.js'
import { NEW_REQUEST, REFETCH_CHATS, ALERT } from '../../constants/constants.js'



const getAllGrps = asyncHandler( async(req, res)=>{

    const userId = req.user?._id;

    const grps = await Chat.find({
        "members.2" : { $exists : true},
        'members' : userId
    });


    return res
    .status(200)
    .json(new ApiResponse(200, grps, "Fetched all grps successfully"));
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


const deleteMembers = asyncHandler( async(req, res)=>{
    
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

export {
    getAllGrps,
    addMemebers,
    deleteMembers,
    newGroupChat
}
