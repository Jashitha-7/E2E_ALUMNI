import mongoose from "mongoose";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Job from "../models/Job.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import JobApplication from "../models/JobApplication.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const listUsers = asyncHandler(async (req, res) => {
  const { role, status, search } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("-password -refreshTokenHash")
    .sort({ createdAt: -1 })
    .lean();

  res.json(users);
});

const approveAlumni = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user id");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { status: "active", role: "alumni", approvedAt: new Date() },
    { new: true }
  ).select("-password -refreshTokenHash");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

const banUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user id");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { status: "banned", bannedAt: new Date(), refreshTokenHash: null },
    { new: true }
  ).select("-password -refreshTokenHash");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

const stats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    pendingUsers,
    bannedUsers,
    totalEvents,
    totalJobs,
    totalChats,
    totalMessages,
    totalApplications,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "pending" }),
    User.countDocuments({ status: "banned" }),
    Event.countDocuments(),
    Job.countDocuments(),
    Chat.countDocuments(),
    Message.countDocuments(),
    JobApplication.countDocuments(),
  ]);

  res.json({
    users: {
      total: totalUsers,
      active: activeUsers,
      pending: pendingUsers,
      banned: bannedUsers,
    },
    totals: {
      events: totalEvents,
      jobs: totalJobs,
      chats: totalChats,
      messages: totalMessages,
      applications: totalApplications,
    },
  });
});

export { listUsers, approveAlumni, banUser, stats };
