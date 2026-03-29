import Notification from "../models/Notification.js";
import logger from "../config/logger.js";

let ioInstance = null;

const setSocketServer = (io) => {
  ioInstance = io;
};

const emitToUser = (userId, payload) => {
  if (!ioInstance) return;
  ioInstance.emit("notification", { userId, ...payload });
};

const createNotification = async ({
  userId,
  title,
  message,
  type = "system",
  data = {},
  priority = "normal",
}) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    data,
    priority,
  });

  emitToUser(userId, { notification });

  return notification;
};

const notifyUsers = async (userIds, payload) => {
  const uniqueUserIds = Array.from(new Set(userIds.map((id) => String(id))));

  const notifications = await Promise.all(
    uniqueUserIds.map((userId) =>
      createNotification({
        userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        data: payload.data || {},
        priority: payload.priority || "normal",
      })
    )
  );

  logger.info("Notifications created", { count: notifications.length });
  return notifications;
};

export { setSocketServer, createNotification, notifyUsers };
