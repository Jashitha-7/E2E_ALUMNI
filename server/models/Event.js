import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, minlength: 10, maxlength: 2000 },
    location: { type: String, trim: true, maxlength: 160 },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    isVirtual: { type: Boolean, default: false },
    meetingUrl: { type: String, trim: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    capacity: { type: Number, min: 1 },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
    },
  },
  { timestamps: true }
);

eventSchema.index({ host: 1, startAt: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ title: "text", description: "text" });

eventSchema.pre("validate", function validateDates(next) {
  if (this.endAt < this.startAt) {
    return next(new Error("endAt must be after startAt"));
  }
  if (this.isVirtual && !this.meetingUrl) {
    return next(new Error("meetingUrl is required for virtual events"));
  }
  return next();
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
