/**
 * Alumni Routes
 * 
 * All routes for alumni-specific functionality:
 * - Dashboard stats
 * - Student directory
 * - Mentorship management
 * - Job posting and management
 * - Events
 * - Chat
 * - Profile
 */

import express from "express";
import protect from "../middlewares/auth.js";
import { requireRole } from "../middlewares/roles.js";
import {
  // Dashboard
  getDashboardStats,
  // Students
  getStudentsDirectory,
  getStudentDetails,
  // Mentorship
  getMentorshipRequests,
  acceptMentorshipRequest,
  declineMentorshipRequest,
  getActiveMentees,
  // Jobs
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobApplicants,
  updateApplicantStatus,
  // Events
  getMyEvents,
  createEvent,
  // Chat
  getMyChats,
  getChatMessages,
  sendMessage,
  // Profile
  getProfile,
  updateProfile,
} from "../controllers/alumniController.js";

const router = express.Router();

// All routes require authentication and alumni role
router.use(protect);
router.use(requireRole("alumni", "admin"));

// ============================================
// DASHBOARD
// ============================================
router.get("/dashboard", getDashboardStats);

// ============================================
// STUDENTS DIRECTORY
// ============================================
router.get("/students", getStudentsDirectory);
router.get("/students/:id", getStudentDetails);

// ============================================
// MENTORSHIP
// ============================================
router.get("/mentorship/requests", getMentorshipRequests);
router.post("/mentorship/accept/:requestId", acceptMentorshipRequest);
router.post("/mentorship/decline/:requestId", declineMentorshipRequest);
router.get("/mentorship/mentees", getActiveMentees);

// ============================================
// JOBS
// ============================================
router.get("/jobs", getMyJobs);
router.post("/jobs", createJob);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);
router.get("/jobs/:id/applicants", getJobApplicants);
router.put("/jobs/:jobId/applicants/:applicantId", updateApplicantStatus);

// ============================================
// EVENTS
// ============================================
router.get("/events", getMyEvents);
router.post("/events", createEvent);

// ============================================
// CHAT
// ============================================
router.get("/chats", getMyChats);
router.get("/chats/:chatId/messages", getChatMessages);
router.post("/chats/:chatId/messages", sendMessage);

// ============================================
// PROFILE
// ============================================
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
