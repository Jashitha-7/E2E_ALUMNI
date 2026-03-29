import express from "express";
import protect from "../middlewares/auth.js";
import { allowRoles } from "../middlewares/roles.js";
import { validate, required } from "../middlewares/validate.js";
import {
  getMyChats,
  getChatMessages,
  sendMessage,
  getOrCreateDirectChat,
} from "../controllers/chatController.js";

const router = express.Router();

const createDirectSchema = {
  body: {
    participantId: required("participantId"),
  },
};

const sendMessageSchema = {
  body: {
    content: required("content"),
  },
};

router.use(protect);
router.use(allowRoles("student", "alumni", "admin"));

router.get("/", getMyChats);
router.post("/direct", validate(createDirectSchema), getOrCreateDirectChat);
router.get("/:chatId/messages", getChatMessages);
router.post("/:chatId/messages", validate(sendMessageSchema), sendMessage);

export default router;
