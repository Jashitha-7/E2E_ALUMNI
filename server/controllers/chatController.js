import asyncHandler from "../middlewares/asyncHandler.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const getMyChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.find({
    participants: userId,
    isArchived: { $ne: true },
  })
    .populate("participants", "name avatarUrl role")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name avatarUrl role" },
    })
    .sort({ updatedAt: -1 })
    .lean();

  const chatsWithUnread = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        sender: { $ne: userId },
        read: false,
      });
      return { ...chat, unreadCount };
    })
  );

  res.json({
    success: true,
    data: chatsWithUnread,
  });
});

const getChatMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const chat = await Chat.findOne({
    _id: chatId,
    participants: userId,
    isArchived: { $ne: true },
  });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 50));

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "name avatarUrl role")
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .lean();

  await Message.updateMany(
    { chat: chatId, sender: { $ne: userId }, read: false },
    { read: true }
  );

  res.json({
    success: true,
    data: messages.reverse(),
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { chatId } = req.params;
  const { content, messageType = "text", attachments = [] } = req.body;

  const normalizedContent = String(content || "").trim();
  if (!normalizedContent) {
    res.status(400);
    throw new Error("content is required");
  }

  const chat = await Chat.findOne({
    _id: chatId,
    participants: userId,
    isArchived: { $ne: true },
  }).populate("participants", "name avatarUrl role");

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  const message = await Message.create({
    chat: chatId,
    sender: userId,
    content: normalizedContent,
    messageType,
    attachments,
  });

  chat.lastMessage = message._id;
  await chat.save();

  const populated = await Message.findById(message._id)
    .populate("sender", "name avatarUrl role")
    .lean();

  req.io?.to(String(chatId)).emit("message", populated);

  chat.participants.forEach((participant) => {
    const participantId = String(participant._id);
    if (participantId !== String(userId)) {
      req.io?.to(`user_${participantId}`).emit("new_message", {
        chatId: String(chatId),
        message: populated,
      });
    }
  });

  res.status(201).json({
    success: true,
    data: populated,
  });
});

const getOrCreateDirectChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { participantId } = req.body;

  if (!participantId) {
    res.status(400);
    throw new Error("participantId is required");
  }

  if (String(participantId) === String(userId)) {
    res.status(400);
    throw new Error("Cannot create chat with yourself");
  }

  const participant = await User.findById(participantId).select("_id status");
  if (!participant || participant.status === "banned") {
    res.status(404);
    throw new Error("Participant not found");
  }

  let chat = await Chat.findOne({
    participants: { $all: [userId, participantId], $size: 2 },
    type: "direct",
    isArchived: { $ne: true },
  })
    .populate("participants", "name avatarUrl role")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name avatarUrl role" },
    });

  if (!chat) {
    chat = await Chat.create({
      type: "direct",
      participants: [userId, participantId],
      createdBy: userId,
      requestStatus: "accepted",
    });

    chat = await Chat.findById(chat._id)
      .populate("participants", "name avatarUrl role")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name avatarUrl role" },
      });
  } else if (chat.type === "direct" && chat.requestStatus !== "accepted") {
    chat.requestStatus = "accepted";
    chat.requestedBy = undefined;
    await chat.save();
  }

  if (chat.type === "direct" && !chat.requestStatus) {
    chat.requestStatus = "accepted";
    chat.requestedBy = undefined;
    await chat.save();
  }

  res.status(201).json({
    success: true,
    data: chat,
  });
});

const getChatRequests = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { incoming: [], outgoing: [] },
  });
});

const acceptChatRequest = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findOne({
    _id: chatId,
    type: "direct",
    participants: req.user._id,
    isArchived: { $ne: true },
  }).populate("participants", "name avatarUrl role");

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  chat.requestStatus = "accepted";
  chat.requestedBy = undefined;
  await chat.save();

  res.json({
    success: true,
    data: chat,
  });
});

const rejectChatRequest = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findOne({
    _id: chatId,
    type: "direct",
    participants: req.user._id,
    isArchived: { $ne: true },
  }).populate("participants", "name avatarUrl role");

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  chat.requestStatus = "accepted";
  chat.requestedBy = undefined;
  await chat.save();

  res.json({
    success: true,
    data: chat,
  });
});

export {
  getMyChats,
  getChatMessages,
  sendMessage,
  getOrCreateDirectChat,
  getChatRequests,
  acceptChatRequest,
  rejectChatRequest,
};
