import mongoose from "mongoose";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { createNotification } from "../services/notificationService.js";

const createJob = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    postedBy: req.user._id,
  };

  const job = await Job.create(payload);
  res.status(201).json(job);
});

const listJobs = asyncHandler(async (req, res) => {
  const { active, search, tag } = req.query;
  const filter = {};

  if (active === "true") filter.isActive = true;
  if (active === "false") filter.isActive = false;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: String(search) };

  const jobs = await Job.find(filter)
    .populate("postedBy", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  res.json(jobs);
});

const applyToJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid job id");
  }

  const job = await Job.findById(id);
  if (!job || !job.isActive) {
    res.status(404);
    throw new Error("Job not found");
  }

  const application = await JobApplication.create({
    job: job._id,
    applicant: req.user._id,
    coverLetter: req.body.coverLetter,
    resumeUrl: req.body.resumeUrl,
    portfolioUrl: req.body.portfolioUrl,
  });

  await createNotification({
    userId: job.postedBy,
    title: "New job application",
    message: `A student applied for ${job.title}`,
    type: "job",
    data: { jobId: job._id, applicationId: application._id },
  });

  res.status(201).json(application);
});

const listApplications = asyncHandler(async (req, res) => {
  const { status, jobId } = req.query;
  const filter = {};

  if (status) filter.status = status;

  if (jobId) {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.status(400);
      throw new Error("Invalid job id");
    }
    filter.job = jobId;
  }

  if (req.user.role !== "admin") {
    const ownedJobs = await Job.find({ postedBy: req.user._id }).select("_id");
    const ownedJobIds = ownedJobs.map((job) => job._id);
    filter.job = filter.job ? filter.job : { $in: ownedJobIds };
  }

  const applications = await JobApplication.find(filter)
    .populate("job", "title company")
    .populate("applicant", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  res.json(applications);
});

export { createJob, listJobs, applyToJob, listApplications };
