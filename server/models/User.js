import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /\S+@\S+\.\S+/, 
    },
    password: { type: String, minlength: 8, select: false }, // Not required initially for invited alumni
    role: { type: String, enum: ["admin", "alumni", "student"], default: "student" },
    status: { type: String, enum: ["pending", "invited", "active", "banned"], default: "pending" },
    approvedAt: { type: Date },
    bannedAt: { type: Date },
    refreshTokenHash: { type: String, select: false },
    avatarUrl: { type: String },
    graduationYear: { type: Number },
    department: { type: String },
    bio: { type: String, maxlength: 400 },
    phone: { type: String },
    location: { type: String },
    currentCompany: { type: String },
    currentRole: { type: String },
    experience: { type: String },
    skills: [{ type: String }],
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
    openToMentor: { type: Boolean, default: false },
    mentorshipTopics: [{ type: String }],
    // Invite system for alumni
    inviteToken: { type: String, select: false },
    inviteTokenExpires: { type: Date, select: false },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    invitedAt: { type: Date },
    // Admin action logging
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    eventsHosted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    eventsAttending: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ graduationYear: 1 });

userSchema.pre("save", async function onSave(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate invite token for alumni
userSchema.methods.generateInviteToken = function generateInviteToken() {
  const token = crypto.randomBytes(32).toString("hex");
  this.inviteToken = crypto.createHash("sha256").update(token).digest("hex");
  this.inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return token;
};

// Verify invite token
userSchema.statics.findByInviteToken = async function findByInviteToken(token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return this.findOne({
    inviteToken: hashedToken,
    inviteTokenExpires: { $gt: Date.now() },
  }).select("+inviteToken +inviteTokenExpires");
};

const User = mongoose.model("User", userSchema);

export default User;
