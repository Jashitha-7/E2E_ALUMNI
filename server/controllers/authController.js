import bcrypt from "bcryptjs";
import User from "../models/User.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import logger from "../config/logger.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../services/tokenService.js";

const issueTokens = async (userId) => {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  const salt = await bcrypt.genSalt(12);
  const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

  await User.findByIdAndUpdate(userId, { refreshTokenHash });

  return { accessToken, refreshToken };
};

/**
 * Student self-registration (public endpoint)
 * - Only students can self-register
 * - Account is active immediately
 */
const studentRegister = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  // Force role to student - no client-side role assignment allowed
  const user = await User.create({
    name,
    email,
    password,
    role: "student",
    status: "active", // Students are active immediately
  });

  const { accessToken, refreshToken } = await issueTokens(user._id);

  logger.info(`New student registered: ${user.email}`);

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    accessToken,
    refreshToken,
  });
});

/**
 * Admin creates alumni account (admin-only endpoint)
 * - Creates account with invited status
 * - Generates invite token for password setup
 * - Returns invite link for admin to send
 */
const adminCreateAlumni = asyncHandler(async (req, res) => {
  const { name, email, graduationYear, department } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  const alumni = new User({
    name,
    email,
    role: "alumni",
    status: "invited",
    graduationYear,
    department,
    invitedBy: req.user._id,
    invitedAt: new Date(),
    createdBy: req.user._id,
  });

  const inviteToken = alumni.generateInviteToken();
  await alumni.save();

  logger.info(`Admin ${req.user.email} created alumni account for ${email}`);

  res.status(201).json({
    id: alumni._id,
    name: alumni.name,
    email: alumni.email,
    role: alumni.role,
    status: alumni.status,
    graduationYear: alumni.graduationYear,
    department: alumni.department,
    inviteLink: `/set-password?token=${inviteToken}`,
    message: "Alumni account created. Send the invite link to the alumni to set their password.",
  });
});

/**
 * Admin creates another admin account (admin-only endpoint)
 * - Only existing admins can create new admins
 * - Creates account with invited status
 * - Generates invite token for password setup
 */
const adminCreateAdmin = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  const admin = new User({
    name,
    email,
    role: "admin",
    status: "invited",
    invitedBy: req.user._id,
    invitedAt: new Date(),
    createdBy: req.user._id,
  });

  const inviteToken = admin.generateInviteToken();
  await admin.save();

  logger.info(`Admin ${req.user.email} created new admin account for ${email}`);

  res.status(201).json({
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    inviteLink: `/set-password?token=${inviteToken}`,
    message: "Admin account created. Send the invite link to set up the password.",
  });
});

/**
 * Set password using invite token (for invited alumni/admin)
 */
const setPasswordWithToken = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findByInviteToken(token);
  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired invite token");
  }

  user.password = password;
  user.status = "active";
  user.inviteToken = undefined;
  user.inviteTokenExpires = undefined;
  user.approvedAt = new Date();
  await user.save();

  const tokens = await issueTokens(user._id);

  logger.info(`User ${user.email} (${user.role}) completed registration via invite`);

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

/**
 * Resend invite to alumni/admin (admin-only)
 */
const resendInvite = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.status !== "invited") {
    res.status(400);
    throw new Error("User has already completed registration");
  }

  const inviteToken = user.generateInviteToken();
  await user.save();

  logger.info(`Admin ${req.user.email} resent invite to ${user.email}`);

  res.json({
    message: "Invite resent successfully",
    inviteLink: `/set-password?token=${inviteToken}`,
  });
});

// Keep legacy register for backwards compatibility but make it student-only
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Block any attempt to register as admin or alumni via public API
  if (role === "admin" || role === "alumni") {
    logger.warn(`Blocked registration attempt with role: ${role} for email: ${email}`);
    res.status(403);
    throw new Error("Cannot register as admin or alumni. Please contact an administrator.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  // Force role to student
  const user = await User.create({
    name,
    email,
    password,
    role: "student",
    status: "active",
  });

  const { accessToken, refreshToken } = await issueTokens(user._id);

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    accessToken,
    refreshToken,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (user.status === "banned") {
    res.status(403);
    throw new Error("Your account is banned. Contact an administrator.");
  }

  if (user.status === "pending") {
    res.status(403);
    throw new Error("Your account is pending approval.");
  }

  if (user.status === "invited" || !user.password) {
    res.status(403);
    throw new Error("Account setup incomplete. Use your invite link to set a password first.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const { accessToken, refreshToken } = await issueTokens(user._id);

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    accessToken,
    refreshToken,
  });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    res.status(401);
    throw new Error("Invalid refresh token");
  }
  const user = await User.findById(decoded.id).select("+refreshTokenHash");

  if (!user || !user.refreshTokenHash) {
    res.status(401);
    throw new Error("Invalid refresh token");
  }

  const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isValid) {
    res.status(401);
    throw new Error("Invalid refresh token");
  }

  const tokens = await issueTokens(user._id);

  res.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      await User.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
    } catch (error) {
      res.status(401);
      throw new Error("Invalid refresh token");
    }
  }

  res.status(204).send();
});

const me = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export {
  register,
  studentRegister,
  adminCreateAlumni,
  adminCreateAdmin,
  setPasswordWithToken,
  resendInvite,
  login,
  refresh,
  logout,
  me,
};
