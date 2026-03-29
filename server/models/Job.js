import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, minlength: 10, maxlength: 3000 },
    location: { type: String, trim: true, maxlength: 120 },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "volunteer"],
      default: "full-time",
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "lead"],
      default: "mid",
    },
    applyUrl: { type: String, trim: true },
    salaryRange: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: "USD" },
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    tags: [{ type: String, trim: true, maxlength: 30 }],
  },
  { timestamps: true }
);

jobSchema.index({ postedBy: 1, createdAt: -1 });
jobSchema.index({ company: 1, title: 1 });
jobSchema.index({ tags: 1 });
jobSchema.index({ title: "text", company: "text", description: "text" });

const Job = mongoose.model("Job", jobSchema);

export default Job;
