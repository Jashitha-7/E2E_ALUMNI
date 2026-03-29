import express from "express";
import {
  createEvent,
  listEvents,
  updateEvent,
  deleteEvent,
  registerForEvent,
  eventAnalytics,
} from "../controllers/eventController.js";
import protect from "../middlewares/auth.js";
import allowRoles from "../middlewares/roles.js";
import { validate, required, minLength, optional, oneOf } from "../middlewares/validate.js";

const router = express.Router();

const createEventSchema = {
  body: {
    title: (value) => (required("title")(value) === true ? minLength("title", 3)(value) : required("title")(value)),
    description: (value) => (required("description")(value) === true ? minLength("description", 10)(value) : required("description")(value)),
    startAt: required("startAt"),
    endAt: required("endAt"),
    isVirtual: optional(() => true),
    meetingUrl: optional(() => true),
    location: optional(() => true),
    capacity: optional(() => true),
    status: optional(oneOf("status", ["draft", "published", "cancelled", "completed"])),
  },
};

const updateEventSchema = {
  body: {
    title: optional(minLength("title", 3)),
    description: optional(minLength("description", 10)),
    startAt: optional(() => true),
    endAt: optional(() => true),
    isVirtual: optional(() => true),
    meetingUrl: optional(() => true),
    location: optional(() => true),
    capacity: optional(() => true),
    status: optional(oneOf("status", ["draft", "published", "cancelled", "completed"])),
  },
};

router.get("/analytics", protect, allowRoles("admin"), eventAnalytics);
router.get("/", listEvents);
router.post("/", protect, allowRoles("admin"), validate(createEventSchema), createEvent);
router.put("/:id", protect, allowRoles("admin"), validate(updateEventSchema), updateEvent);
router.delete("/:id", protect, allowRoles("admin"), deleteEvent);
router.post("/:id/register", protect, allowRoles("alumni", "student"), registerForEvent);

export default router;
