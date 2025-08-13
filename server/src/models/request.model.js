import mongoose from  "mongoose";

const Reqschema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "rejected"],
    },

    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Request = mongoose.model("Request", Reqschema);
