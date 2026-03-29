/**
 * Alumni Controller
 * 
 * Handles all alumni-specific operations:
 * - Dashboard stats
 * - Student directory
 * - Mentorship management
 * - Job posting and applicant management
 * - Profile management
 */

import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import Event from "../models/Event.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

// ============================================
// DASHBOARD
// ============================================

/**
 * Get alumni dashboard overview stats
 * @route GET /api/alumni/dashboard
 * @access Private (Alumni only)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;

  // Get various stats in parallel
  const [
    menteeCount,
    pendingRequests,
    postedJobsCount,
    activeJobsCount,
    totalApplicants,
    eventsHosted,
    eventsAttending,
    recentActivity,
  ] = await Promise.all([
    // Count active mentees (students the alumni is mentoring)
    User.countDocuments({
      "mentorship.mentor": alumniId,
      "mentorship.status": "active",
    }),
    // Count pending mentorship requests
    Notification.countDocuments({
      recipient: alumniId,
      type: "mentorship_request",
      read: false,
    }),
    // Count total jobs posted
    Job.countDocuments({ postedBy: alumniId }),
    // Count active jobs
    Job.countDocuments({ postedBy: alumniId, status: "active" }),
    // Count total applicants across all jobs
    JobApplication.countDocuments({
      job: { $in: await Job.find({ postedBy: alumniId }).distinct("_id") },
    }),
    // Count events hosted
    Event.countDocuments({ host: alumniId }),
    // Count events attending
    Event.countDocuments({ attendees: alumniId }),
    // Get recent activity
    Notification.find({ recipient: alumniId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("sender", "name avatarUrl")
      .lean(),
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        mentees: menteeCount,
        pendingRequests,
        postedJobs: postedJobsCount,
        activeJobs: activeJobsCount,
        totalApplicants,
        eventsHosted,
        eventsAttending,
      },
      recentActivity,
    },
  });
});

// ============================================
// STUDENT DIRECTORY
// ============================================

/**
 * Get students directory for alumni
 * @route GET /api/alumni/students
 * @access Private (Alumni only)
 */
const getStudentsDirectory = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    department,
    year,
    skills,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = { role: "student", status: "active" };

  // Search by name or email
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by department
  if (department) {
    query.department = department;
  }

  // Filter by graduation year
  if (year) {
    query.graduationYear = parseInt(year);
  }

  // Filter by skills
  if (skills) {
    const skillsArray = skills.split(",").map((s) => s.trim());
    query.skills = { $in: skillsArray };
  }

  const students = await User.find(query)
    .select("name email avatarUrl department graduationYear bio skills createdAt")
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * Get student details by ID
 * @route GET /api/alumni/students/:id
 * @access Private (Alumni only)
 */
const getStudentDetails = asyncHandler(async (req, res) => {
  const student = await User.findOne({
    _id: req.params.id,
    role: "student",
    status: "active",
  })
    .select("name email avatarUrl department graduationYear bio skills linkedin github portfolio createdAt")
    .lean();

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  res.json({
    success: true,
    data: student,
  });
});

// ============================================
// MENTORSHIP
// ============================================

/**
 * Get mentorship requests for alumni
 * @route GET /api/alumni/mentorship/requests
 * @access Private (Alumni only)
 */
const getMentorshipRequests = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;

  const requests = await Notification.find({
    recipient: alumniId,
    type: "mentorship_request",
  })
    .populate("sender", "name email avatarUrl department graduationYear")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: requests,
  });
});

/**
 * Accept mentorship request
 * @route POST /api/alumni/mentorship/accept/:requestId
 * @access Private (Alumni only)
 */
const acceptMentorshipRequest = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const { requestId } = req.params;

  const notification = await Notification.findOne({
    _id: requestId,
    recipient: alumniId,
    type: "mentorship_request",
  }).populate("sender");

  if (!notification) {
    res.status(404);
    throw new Error("Request not found");
  }

  // Update student's mentorship status
  await User.findByIdAndUpdate(notification.sender._id, {
    $set: {
      "mentorship.mentor": alumniId,
      "mentorship.status": "active",
      "mentorship.startedAt": new Date(),
    },
  });

  // Mark notification as read
  notification.read = true;
  await notification.save();

  // Create notification for student
  await Notification.create({
    recipient: notification.sender._id,
    sender: alumniId,
    type: "mentorship_accepted",
    title: "Mentorship Request Accepted",
    message: `${req.user.name} has accepted your mentorship request!`,
  });

  // Create a chat between alumni and student
  let chat = await Chat.findOne({
    participants: { $all: [alumniId, notification.sender._id] },
    type: "mentorship",
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [alumniId, notification.sender._id],
      type: "mentorship",
    });
  }

  // Emit socket event for real-time notification
  req.io?.to(`user_${notification.sender._id}`).emit("mentorship_accepted", {
    mentorId: alumniId,
    mentorName: req.user.name,
    chatId: chat._id,
  });

  res.json({
    success: true,
    message: "Mentorship request accepted",
    data: { chatId: chat._id },
  });
});

/**
 * Decline mentorship request
 * @route POST /api/alumni/mentorship/decline/:requestId
 * @access Private (Alumni only)
 */
const declineMentorshipRequest = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const { requestId } = req.params;
  const { reason } = req.body;

  const notification = await Notification.findOne({
    _id: requestId,
    recipient: alumniId,
    type: "mentorship_request",
  }).populate("sender");

  if (!notification) {
    res.status(404);
    throw new Error("Request not found");
  }

  // Delete the request notification
  await notification.deleteOne();

  // Create notification for student
  await Notification.create({
    recipient: notification.sender._id,
    sender: alumniId,
    type: "mentorship_declined",
    title: "Mentorship Request Declined",
    message: reason || `${req.user.name} is unable to mentor at this time.`,
  });

  // Emit socket event
  req.io?.to(`user_${notification.sender._id}`).emit("mentorship_declined", {
    mentorId: alumniId,
  });

  res.json({
    success: true,
    message: "Mentorship request declined",
  });
});

/**
 * Get active mentees
 * @route GET /api/alumni/mentorship/mentees
 * @access Private (Alumni only)
 */
const getActiveMentees = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;

  const mentees = await User.find({
    "mentorship.mentor": alumniId,
    "mentorship.status": "active",
  })
    .select("name email avatarUrl department graduationYear mentorship")
    .lean();

  res.json({
    success: true,
    data: mentees,
  });
});

// ============================================
// JOB MANAGEMENT
// ============================================

/**
 * Get jobs posted by alumni
 * @route GET /api/alumni/jobs
 * @access Private (Alumni only)
 */
const getMyJobs = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  const query = { postedBy: alumniId };
  if (status) {
    query.status = status;
  }

  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  // Get applicant counts for each job
  const jobIds = jobs.map((j) => j._id);
  const applicantCounts = await JobApplication.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: "$job", count: { $sum: 1 } } },
  ]);

  const applicantCountMap = applicantCounts.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  const jobsWithCounts = jobs.map((job) => ({
    ...job,
    applicantCount: applicantCountMap[job._id.toString()] || 0,
  }));

  const total = await Job.countDocuments(query);

  res.json({
    success: true,
    data: {
      jobs: jobsWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * Create a new job posting
 * @route POST /api/alumni/jobs
 * @access Private (Alumni only)
 */
const createJob = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const {
    title,
    company,
    location,
    type,
    description,
    requirements,
    salary,
    deadline,
    remote,
    skills,
  } = req.body;

  const job = await Job.create({
    title,
    company,
    location,
    type,
    description,
    requirements,
    salary,
    deadline,
    remote,
    skills,
    postedBy: alumniId,
    status: "active",
  });

  // Notify matching students (those with matching skills)
  if (skills && skills.length > 0) {
    const matchingStudents = await User.find({
      role: "student",
      status: "active",
      skills: { $in: skills },
    }).select("_id");

    const notifications = matchingStudents.map((student) => ({
      recipient: student._id,
      sender: alumniId,
      type: "new_job",
      title: "New Job Opportunity",
      message: `A new ${title} position at ${company} matches your skills!`,
      link: `/jobs/${job._id}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Emit socket events
    matchingStudents.forEach((student) => {
      req.io?.to(`user_${student._id}`).emit("new_job_match", {
        jobId: job._id,
        title,
        company,
      });
    });
  }

  res.status(201).json({
    success: true,
    data: job,
  });
});

/**
 * Update a job posting
 * @route PUT /api/alumni/jobs/:id
 * @access Private (Alumni only)
 */
const updateJob = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const { id } = req.params;

  const job = await Job.findOne({ _id: id, postedBy: alumniId });

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  const allowedUpdates = [
    "title",
    "company",
    "location",
    "type",
    "description",
    "requirements",
    "salary",
    "deadline",
    "remote",
    "skills",
    "status",
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });

  await job.save();

  res.json({
    success: true,
    data: job,
  });
});

/**
 * Delete a job posting
 * @route DELETE /api/alumni/jobs/:id
 * @access Private (Alumni only)
 */
const deleteJob = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const { id } = req.params;

  const job = await Job.findOneAndDelete({ _id: id, postedBy: alumniId });

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Delete all applications for this job
  await JobApplication.deleteMany({ job: id });

  res.json({
    success: true,
    message: "Job deleted successfully",
  });
});

/**
 * Get applicants for a job
 * @route GET /api/alumni/jobs/:id/applicants
 * @access Private (Alumni only)
 */
const getJobApplicants = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const { id } = req.params;
  const { status, page = 1, limit = 20 } = req.query;

  // Verify job ownership
  const job = await Job.findOne({ _id: id, postedBy: alumniId });
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  const query = { job: id };
  if (status) {
    query.status = status;
  }

  const applications = await JobApplication.find(query)
    .populate("applicant", "name email avatarUrl department graduationYear skills")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await JobApplication.countDocuments(query);

  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * Update applicant status
 * @route PUT /api/alumni/jobs/:jobId/applicants/:applicantId
 * @access Private (Alumni only)
 */
const updateApplicantStatus = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const { jobId, applicantId } = req.params;
  const { status } = req.body;

  // Verify job ownership
  const job = await Job.findOne({ _id: jobId, postedBy: alumniId });
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  const application = await JobApplication.findOneAndUpdate(
    { job: jobId, applicant: applicantId },
    { status },
    { new: true }
  ).populate("applicant", "name email");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Notify applicant
  const statusMessages = {
    reviewed: "Your application is being reviewed",
    shortlisted: "Congratulations! You've been shortlisted",
    rejected: "We've decided to move forward with other candidates",
    hired: "Congratulations! You've been selected!",
  };

  await Notification.create({
    recipient: applicantId,
    sender: alumniId,
    type: "application_update",
    title: `Application Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `${statusMessages[status]} for ${job.title} at ${job.company}`,
    link: `/jobs/${jobId}`,
  });

  // Emit socket event
  req.io?.to(`user_${applicantId}`).emit("application_status_update", {
    jobId,
    jobTitle: job.title,
    status,
  });

  res.json({
    success: true,
    data: application,
  });
});

// ============================================
// EVENTS
// ============================================

/**
 * Get alumni's events
 * @route GET /api/alumni/events
 * @access Private (Alumni only)
 */
const getMyEvents = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const { type = "all", page = 1, limit = 10 } = req.query;

  let events;
  let total;

  if (type === "hosted") {
    events = await Event.find({ host: alumniId })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    total = await Event.countDocuments({ host: alumniId });
  } else if (type === "attending") {
    events = await Event.find({ attendees: alumniId })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    total = await Event.countDocuments({ attendees: alumniId });
  } else {
    events = await Event.find({
      $or: [{ host: alumniId }, { attendees: alumniId }],
    })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    total = await Event.countDocuments({
      $or: [{ host: alumniId }, { attendees: alumniId }],
    });
  }

  res.json({
    success: true,
    data: {
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * Create an event
 * @route POST /api/alumni/events
 * @access Private (Alumni only)
 */
const createEvent = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const { title, description, date, time, location, type, maxAttendees, tags } = req.body;

  const event = await Event.create({
    title,
    description,
    date,
    time,
    location,
    type,
    maxAttendees,
    tags,
    host: alumniId,
    attendees: [alumniId],
  });

  // Notify students interested in the event type/tags
  const interestedStudents = await User.find({
    role: "student",
    status: "active",
    $or: [{ interests: { $in: tags } }, { department: { $in: tags } }],
  }).select("_id");

  const notifications = interestedStudents.map((student) => ({
    recipient: student._id,
    sender: alumniId,
    type: "new_event",
    title: "New Event",
    message: `${req.user.name} is hosting "${title}"`,
    link: `/events/${event._id}`,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json({
    success: true,
    data: event,
  });
});

// ============================================
// CHAT
// ============================================

/**
 * Get alumni's conversations
 * @route GET /api/alumni/chats
 * @access Private (Alumni only)
 */
const getMyChats = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;

  const chats = await Chat.find({ participants: alumniId })
    .populate("participants", "name avatarUrl role")
    .populate("lastMessage")
    .sort({ updatedAt: -1 })
    .lean();

  // Get unread counts for each chat
  const chatsWithUnread = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        sender: { $ne: alumniId },
        read: false,
      });
      return { ...chat, unreadCount };
    })
  );

  res.json({
    success: true,
    data: chatsWithUnread,
  });
});

/**
 * Get messages for a chat
 * @route GET /api/alumni/chats/:chatId/messages
 * @access Private (Alumni only)
 */
const getChatMessages = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const { chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Verify chat membership
  const chat = await Chat.findOne({
    _id: chatId,
    participants: alumniId,
  });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "name avatarUrl")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  // Mark messages as read
  await Message.updateMany(
    { chat: chatId, sender: { $ne: alumniId }, read: false },
    { read: true }
  );

  res.json({
    success: true,
    data: messages.reverse(),
  });
});

/**
 * Send a message
 * @route POST /api/alumni/chats/:chatId/messages
 * @access Private (Alumni only)
 */
const sendMessage = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  const { chatId } = req.params;
  const { content, type = "text" } = req.body;

  // Verify chat membership
  const chat = await Chat.findOne({
    _id: chatId,
    participants: alumniId,
  }).populate("participants", "name");

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  const message = await Message.create({
    chat: chatId,
    sender: alumniId,
    content,
    type,
  });

  // Update chat's last message
  chat.lastMessage = message._id;
  await chat.save();

  // Populate sender info
  await message.populate("sender", "name avatarUrl");

  // Emit to all participants
  chat.participants.forEach((participant) => {
    if (participant._id.toString() !== alumniId.toString()) {
      req.io?.to(`user_${participant._id}`).emit("new_message", {
        chatId,
        message,
      });
    }
  });

  res.status(201).json({
    success: true,
    data: message,
  });
});

// ============================================
// PROFILE
// ============================================

/**
 * Get alumni profile
 * @route GET /api/alumni/profile
 * @access Private (Alumni only)
 */
const getProfile = asyncHandler(async (req, res) => {
  const alumni = await User.findById(req.user._id)
    .select("-password -refreshTokenHash")
    .lean();

  // Get additional stats
  const [menteeCount, jobsPosted, eventsHosted] = await Promise.all([
    User.countDocuments({ "mentorship.mentor": req.user._id, "mentorship.status": "active" }),
    Job.countDocuments({ postedBy: req.user._id }),
    Event.countDocuments({ host: req.user._id }),
  ]);

  res.json({
    success: true,
    data: {
      ...alumni,
      stats: {
        mentees: menteeCount,
        jobsPosted,
        eventsHosted,
      },
    },
  });
});

/**
 * Update alumni profile
 * @route PUT /api/alumni/profile
 * @access Private (Alumni only)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    "name",
    "bio",
    "avatarUrl",
    "department",
    "graduationYear",
    "currentCompany",
    "currentRole",
    "experience",
    "location",
    "skills",
    "linkedin",
    "github",
    "portfolio",
    "phone",
    "openToMentor",
    "mentorshipTopics",
  ];

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const alumni = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  ).select("-password -refreshTokenHash");

  res.json({
    success: true,
    data: alumni,
  });
});

export {
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
};
