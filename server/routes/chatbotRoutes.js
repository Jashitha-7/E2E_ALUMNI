/**
 * Chatbot Routes
 * 
 * All chatbot endpoints - restricted to students only
 */

import express from "express";
import protect from "../middlewares/auth.js";
import { allowRoles } from "../middlewares/roles.js";
import { 
  queryChatbot, 
  handleQuickAction, 
  webhook, 
  getConversationHistory 
} from "../controllers/chatbotController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiting for chatbot to prevent abuse
const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Protected routes (student only)
router.post("/query", protect, allowRoles("student"), chatbotLimiter, queryChatbot);
router.post("/action", protect, allowRoles("student"), chatbotLimiter, handleQuickAction);
router.get("/history/:sessionId", protect, allowRoles("student"), getConversationHistory);

// Webhook for Dialogflow fulfillment (no auth needed - called by Dialogflow)
router.post("/webhook", webhook);

export default router;
