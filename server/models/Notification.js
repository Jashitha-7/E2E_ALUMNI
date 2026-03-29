import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    type: {
      type: String,
      enum: [
        "system",
        "event",
        "job",
        "message",
        "success-story",
        "mentorship_request",
        "mentorship_accepted",
        "mentorship_declined",
        "application_update",
        "new_job",
        "new_event",
      ],
      default: "system",
    },
    data: { type: Object, default: {} },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    link: { type: String, trim: true },
    priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1, readAt: 1 });

notificationSchema.pre("validate", function syncLegacyFields(next) {
  if (!this.user && this.recipient) {
    this.user = this.recipient;
  }

  if (!this.recipient && this.user) {
    this.recipient = this.user;
  }

  if (this.readAt && this.read !== true) {
    this.read = true;
  }

  if (this.read === true && !this.readAt) {
    this.readAt = new Date();
  }

  next();
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
