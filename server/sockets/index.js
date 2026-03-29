import { Server } from "socket.io";
import env from "../config/env.js";
import logger from "../config/logger.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { verifyAccessToken } from "../services/tokenService.js";
import { notifyUsers } from "../services/notificationService.js";

const onlineUsers = new Map();

const isLocalDevOrigin = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

const addOnlineUser = (userId, socketId) => {
  const existing = onlineUsers.get(userId) || new Set();
  existing.add(socketId);
  onlineUsers.set(userId, existing);
};

const removeOnlineUser = (userId, socketId) => {
  const existing = onlineUsers.get(userId);
  if (!existing) return false;

  existing.delete(socketId);
  if (existing.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }

  onlineUsers.set(userId, existing);
  return false;
};

const initSockets = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (origin === env.clientOrigin) {
          callback(null, true);
          return;
        }

        if (env.nodeEnv !== "production" && isLocalDevOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const authToken = socket.handshake.auth?.token;
    const headerToken = socket.handshake.headers?.authorization?.split(" ")[1];
    const token = authToken || headerToken;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.data.userId = decoded.id;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    const userId = socket.data.userId;
    if (userId) {
      addOnlineUser(userId, socket.id);
      io.emit("presence", { userId, status: "online" });
    }

    socket.on("join", async (payload, callback) => {
      try {
        const { chatId } = payload || {};
        if (!chatId) throw new Error("chatId is required");

        const chat = await Chat.findById(chatId).select("participants");
        if (!chat) throw new Error("Chat not found");

        const isParticipant = chat.participants.some(
          (participantId) => participantId.toString() === String(userId)
        );
        if (!isParticipant) throw new Error("Not a participant in this chat");

        socket.join(chatId);
        callback?.({ ok: true, chatId });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("typing", (payload) => {
      const { chatId, isTyping } = payload || {};
      if (!chatId) return;
      socket.to(chatId).emit("typing", {
        chatId,
        userId,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on("message", async (payload, callback) => {
      try {
        const { chatId, content, messageType = "text", attachments = [] } = payload || {};
        if (!chatId || !content) throw new Error("chatId and content are required");

        const chat = await Chat.findById(chatId).select("participants");
        if (!chat) throw new Error("Chat not found");

        const isParticipant = chat.participants.some(
          (participantId) => participantId.toString() === String(userId)
        );
        if (!isParticipant) throw new Error("Not a participant in this chat");

        const message = await Message.create({
          chat: chatId,
          sender: userId,
          content,
          messageType,
          attachments,
        });

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        const populated = await Message.findById(message._id)
          .populate("sender", "name avatarUrl role")
          .lean();

        io.to(chatId).emit("message", populated);

        const otherParticipants = chat.participants.filter(
          (participantId) => participantId.toString() !== String(userId)
        );

        if (otherParticipants.length) {
          await notifyUsers(otherParticipants, {
            title: "New message",
            message: populated.content,
            type: "message",
            data: { chatId, messageId: populated._id },
          });
        }
        callback?.({ ok: true, message: populated });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      if (!userId) return;

      const isOffline = removeOnlineUser(userId, socket.id);
      if (isOffline) {
        io.emit("presence", { userId, status: "offline" });
      }
    });

    // ============================================
    // ALUMNI-STUDENT EVENTS
    // ============================================

    // Join user's personal room for direct notifications
    socket.join(`user_${userId}`);

    // Request mentorship from an alumni
    socket.on("mentorship_request", async (payload, callback) => {
      try {
        const { alumniId, topic, message } = payload || {};
        if (!alumniId) throw new Error("alumniId is required");

        // Verify the target is an alumni
        const alumni = await User.findOne({ _id: alumniId, role: "alumni" });
        if (!alumni) throw new Error("Alumni not found");

        // Create notification for alumni
        const notification = await Notification.create({
          recipient: alumniId,
          sender: userId,
          type: "mentorship_request",
          title: "New Mentorship Request",
          message: message || `A student wants you to be their mentor`,
          data: { topic },
        });

        // Get sender info
        const sender = await User.findById(userId).select("name avatarUrl department graduationYear");

        // Emit to alumni's room
        io.to(`user_${alumniId}`).emit("mentorship_request", {
          requestId: notification._id,
          student: sender,
          topic,
          message,
          createdAt: notification.createdAt,
        });

        callback?.({ ok: true, requestId: notification._id });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    // Start a video call session
    socket.on("start_video_call", async (payload, callback) => {
      try {
        const { chatId, targetUserId } = payload || {};
        if (!chatId || !targetUserId) throw new Error("chatId and targetUserId are required");

        // Verify chat membership
        const chat = await Chat.findById(chatId).select("participants");
        if (!chat) throw new Error("Chat not found");

        const isParticipant = chat.participants.some(
          (participantId) => participantId.toString() === String(userId)
        );
        if (!isParticipant) throw new Error("Not a participant in this chat");

        // Get caller info
        const caller = await User.findById(userId).select("name avatarUrl");

        // Emit call invitation to target user
        io.to(`user_${targetUserId}`).emit("incoming_video_call", {
          chatId,
          callerId: userId,
          callerName: caller.name,
          callerAvatar: caller.avatarUrl,
        });

        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    // Accept video call
    socket.on("accept_video_call", async (payload) => {
      const { chatId, callerId } = payload || {};
      if (!chatId || !callerId) return;

      io.to(`user_${callerId}`).emit("video_call_accepted", {
        chatId,
        accepterId: userId,
      });
    });

    // Decline video call
    socket.on("decline_video_call", async (payload) => {
      const { chatId, callerId, reason } = payload || {};
      if (!chatId || !callerId) return;

      io.to(`user_${callerId}`).emit("video_call_declined", {
        chatId,
        declinerId: userId,
        reason,
      });
    });

    // End video call
    socket.on("end_video_call", async (payload) => {
      const { chatId, targetUserId } = payload || {};
      if (!chatId || !targetUserId) return;

      io.to(`user_${targetUserId}`).emit("video_call_ended", {
        chatId,
        endedBy: userId,
      });
    });

    // Real-time job application notification
    socket.on("job_applied", async (payload, callback) => {
      try {
        const { jobId, alumniId } = payload || {};
        if (!jobId || !alumniId) throw new Error("jobId and alumniId are required");

        const applicant = await User.findById(userId).select("name avatarUrl department");

        io.to(`user_${alumniId}`).emit("new_job_application", {
          jobId,
          applicant,
          appliedAt: new Date(),
        });

        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    // Mark messages as read
    socket.on("mark_read", async (payload) => {
      const { chatId, messageIds } = payload || {};
      if (!chatId) return;

      try {
        if (messageIds && messageIds.length > 0) {
          await Message.updateMany(
            { _id: { $in: messageIds }, sender: { $ne: userId } },
            { read: true }
          );
        } else {
          await Message.updateMany(
            { chat: chatId, sender: { $ne: userId }, read: false },
            { read: true }
          );
        }

        // Notify other participants that messages were read
        socket.to(chatId).emit("messages_read", {
          chatId,
          readBy: userId,
          messageIds,
        });
      } catch (error) {
        logger.error("Error marking messages as read:", error);
      }
    });

    // Get online status of specific users
    socket.on("check_online", (payload, callback) => {
      const { userIds } = payload || {};
      if (!userIds || !Array.isArray(userIds)) {
        callback?.({ ok: false, message: "userIds array required" });
        return;
      }

      const statuses = userIds.reduce((acc, id) => {
        acc[id] = onlineUsers.has(id) ? "online" : "offline";
        return acc;
      }, {});

      callback?.({ ok: true, statuses });
    });
  });

  return io;
};

export default initSockets;
