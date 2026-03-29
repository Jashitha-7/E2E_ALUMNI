import mongoose from "mongoose";
import env from "../config/env.js";
import connectDb from "../config/db.js";
import logger from "../config/logger.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Job from "../models/Job.js";

const seed = async () => {
  await connectDb();

  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Job.deleteMany({}),
  ]);

  const [admin, alumni, student] = await User.create([
    {
      name: "Admin User",
      email: "admin@alumni.com",
      password: "Admin@1234",
      role: "admin",
      status: "active",
      approvedAt: new Date(),
    },
    {
      name: "Alumni Member",
      email: "alumni@alumni.com",
      password: "Alumni@1234",
      role: "alumni",
      status: "active",
      approvedAt: new Date(),
      graduationYear: 2022,
      department: "Computer Science",
    },
    {
      name: "Student Member",
      email: "student@alumni.com",
      password: "Student@1234",
      role: "student",
      status: "active",
      approvedAt: new Date(),
      graduationYear: 2026,
      department: "Information Technology",
    },
  ]);

  const event = await Event.create({
    title: "Alumni Networking Night",
    description: "Join alumni and students for a networking evening with industry leaders.",
    location: "Main Campus Auditorium",
    startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    host: admin._id,
    attendees: [alumni._id, student._id],
    capacity: 200,
    tags: ["networking", "career"],
    status: "published",
  });

  const job = await Job.create({
    title: "Frontend Engineer",
    company: "TechWave",
    description: "Build delightful web experiences for our alumni platform.",
    location: "Remote",
    employmentType: "full-time",
    experienceLevel: "mid",
    applyUrl: "https://techwave.example/jobs/frontend",
    postedBy: alumni._id,
    isActive: true,
    tags: ["react", "frontend"],
  });

  logger.info("Seed data created", {
    users: 3,
    eventId: event._id,
    jobId: job._id,
  });

  await mongoose.connection.close();
};

seed().catch((error) => {
  logger.error("Seed failed", error);
  mongoose.connection.close();
  process.exit(1);
});
