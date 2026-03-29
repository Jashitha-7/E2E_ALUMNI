import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import Event from "../models/Event.js";
import Job from "../models/Job.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { createNotification, notifyUsers } from "../services/notificationService.js";

const listNotifications = asyncHandler(async (req, res) => {
  const { unread } = req.query;
  const filter = { user: req.user._id };

  if (unread === "true") {
    filter.readAt = { $exists: false };
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  res.json(notifications);
});

const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid notification id");
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.json(notification);
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, readAt: { $exists: false } },
    { readAt: new Date() }
  );

  res.status(204).send();
});

const sendEventReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid event id");
  }

  const event = await Event.findById(id).select("title startAt attendees");
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  const notifications = await notifyUsers(event.attendees, {
    title: "Event reminder",
    message: `Reminder: ${event.title} starts soon`,
    type: "event",
    data: { eventId: event._id, startAt: event.startAt },
    priority: "high",
  });

  res.json({ sent: notifications.length });
});

const sendJobUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, message } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid job id");
  }

  const job = await Job.findById(id).select("title");
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  const notifications = await createNotification({
    userId: req.user._id,
    title: title || "Job update",
    message: message || `Update for ${job.title}`,
    type: "job",
    data: { jobId: job._id },
  });

  res.json(notifications);
});

export { listNotifications, markRead, markAllRead, sendEventReminder, sendJobUpdate };
