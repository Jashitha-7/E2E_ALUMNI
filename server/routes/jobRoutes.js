import express from "express";
import {
  createJob,
  listJobs,
  applyToJob,
  listApplications,
} from "../controllers/jobController.js";
import protect from "../middlewares/auth.js";
import allowRoles from "../middlewares/roles.js";
import { validate, required, minLength, optional, oneOf } from "../middlewares/validate.js";

const router = express.Router();

const createJobSchema = {
  body: {
    title: (value) => (required("title")(value) === true ? minLength("title", 3)(value) : required("title")(value)),
    company: required("company"),
    description: (value) => (required("description")(value) === true ? minLength("description", 10)(value) : required("description")(value)),
    employmentType: optional(oneOf("employmentType", ["full-time", "part-time", "contract", "internship", "volunteer"])),
    experienceLevel: optional(oneOf("experienceLevel", ["entry", "mid", "senior", "lead"])),
    applyUrl: optional(() => true),
    location: optional(() => true),
    tags: optional(() => true),
  },
};

const applySchema = {
  body: {
    coverLetter: optional(minLength("coverLetter", 10)),
    resumeUrl: optional(() => true),
    portfolioUrl: optional(() => true),
  },
};

router.get("/applications", protect, allowRoles("admin", "alumni"), listApplications);
router.get("/", listJobs);
router.post("/", protect, allowRoles("alumni"), validate(createJobSchema), createJob);
router.post("/:id/apply", protect, allowRoles("student"), validate(applySchema), applyToJob);

export default router;
