import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 120 },
    type: { type: String, enum: ["direct", "group", "mentorship"], default: "direct" },
    requestStatus: { type: String, enum: ["pending", "accepted", "rejected"], default: "accepted" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });
chatSchema.index({ participants: 1, requestStatus: 1 });
chatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
