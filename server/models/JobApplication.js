import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["submitted", "review", "interview", "offer", "rejected", "withdrawn"],
      default: "submitted",
    },
    coverLetter: { type: String, trim: true, maxlength: 4000 },
    resumeUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
jobApplicationSchema.index({ applicant: 1, createdAt: -1 });
jobApplicationSchema.index({ job: 1, status: 1 });

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
