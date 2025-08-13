import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    
  content: {
    type: String,
    default: "Shared an attachment" 
  },
  sender : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true
    },
  attachements : [{
    type : String
    }],
  chat : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Chat",
    required : true
    }

}, {timestamps : true});

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
