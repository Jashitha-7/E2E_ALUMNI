import express from "express";
import protect from "../middlewares/auth.js";
import allowRoles from "../middlewares/roles.js";
import { validate, optional, minLength } from "../middlewares/validate.js";
import {
  listNotifications,
  markRead,
  markAllRead,
  sendEventReminder,
  sendJobUpdate,
} from "../controllers/notificationController.js";

const router = express.Router();

const jobUpdateSchema = {
  body: {
    title: optional(minLength("title", 3)),
    message: optional(minLength("message", 5)),
  },
};

router.get("/", protect, listNotifications);
router.patch("/:id/read", protect, markRead);
router.post("/read-all", protect, markAllRead);
router.post("/events/:id/remind", protect, allowRoles("admin"), sendEventReminder);
router.post("/jobs/:id/update", protect, allowRoles("admin", "alumni"), validate(jobUpdateSchema), sendJobUpdate);

export default router;
