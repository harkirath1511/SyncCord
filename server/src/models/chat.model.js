import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    
    name : {
        type : String,
        required : true,
    },
    creator : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    groupChat : {
        type : Boolean,
        default : false
    },
    members : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    }],
    avatar : {
        type : String
    }

}, {timestamps : true});

export const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema)
