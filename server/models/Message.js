import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    messageType: { type: String, enum: ["text", "image", "file"], default: "text" },
    read: { type: Boolean, default: false, index: true },
    attachments: [
      {
        url: { type: String, trim: true },
        name: { type: String, trim: true, maxlength: 120 },
        size: { type: Number, min: 0 },
      },
    ],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
