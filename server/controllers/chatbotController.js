/**
 * AI Chatbot Controller
 * 
 * Handles chatbot queries with:
 * - Dialogflow integration (primary)
 * - Built-in NLP fallback
 * - Database queries for real data
 * - Context-aware responses
 */

import asyncHandler from "../middlewares/asyncHandler.js";
import { detectIntent } from "../services/dialogflowService.js";
import Event from "../models/Event.js";
import Job from "../models/Job.js";
import User from "../models/User.js";

// ============================================
// FAQ RESPONSES
// ============================================
const faqResponses = {
  "faq.membership": "Membership is open to alumni and current students. Apply via the registration page.",
  "faq.fees": "Membership is currently free for students and alumni.",
  "faq.support": "You can contact support at support@alumni-platform.com.",
  "faq.platform": "The Alumni Association Platform helps students connect with alumni for mentorship, job opportunities, and networking events.",
};

// ============================================
// INTENT PATTERNS (Built-in NLP)
// ============================================
const intentPatterns = [
  {
    patterns: [/hello|hi|hey|good morning|good afternoon|good evening|greetings/i],
    intent: "greeting",
    handler: async (userId, userName) => ({
      text: `Hello ${userName || "there"}! 👋 I'm your AI assistant. I can help you with events, jobs, finding alumni, and navigating the platform. What would you like to know?`,
      actions: ["show_events", "show_jobs", "show_alumni", "show_help"],
    }),
  },
  {
    patterns: [/event|upcoming|happening|conference|workshop|webinar|meetup|what.*(event|happening)/i],
    intent: "event.list",
    handler: async () => {
      const events = await Event.find({ 
        startAt: { $gte: new Date() }, 
        status: "published" 
      })
        .sort({ startAt: 1 })
        .limit(5)
        .lean();

      if (!events.length) {
        return {
          text: "📅 There are no upcoming events scheduled at the moment. Check back soon or subscribe to get notified!",
          actions: ["show_help"],
        };
      }

      const eventList = events
        .map((e, i) => `${i + 1}. **${e.title}** - ${new Date(e.startAt).toLocaleDateString()}`)
        .join("\n");

      return {
        text: `📅 Here are the upcoming events:\n\n${eventList}\n\nWould you like more details or help registering?`,
        actions: ["navigate_events", "help_register"],
        data: { events },
      };
    },
  },
  {
    patterns: [/job|career|work|hiring|position|opening|internship|opportunity|employment/i],
    intent: "job.list",
    handler: async () => {
      const jobs = await Job.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      if (!jobs.length) {
        return {
          text: "💼 No active job listings at the moment. New opportunities are added regularly, so check back soon!",
          actions: ["show_help"],
        };
      }

      const jobList = jobs
        .map((j, i) => `${i + 1}. **${j.title}** at ${j.company}${j.location ? ` - ${j.location}` : ""}`)
        .join("\n");

      return {
        text: `💼 Here are the latest job opportunities:\n\n${jobList}\n\nWould you like help applying?`,
        actions: ["navigate_jobs", "help_apply"],
        data: { jobs },
      };
    },
  },
  {
    patterns: [/alumni|mentor|connect|network|professional|graduate|find.*(alumni|people)/i],
    intent: "alumni.search",
    handler: async () => {
      const alumniCount = await User.countDocuments({ role: "alumni" });
      const companies = await User.distinct("company", { role: "alumni", company: { $ne: null } });
      
      const topCompanies = companies.slice(0, 5).join(", ");

      return {
        text: `👥 Our alumni network has **${alumniCount}+ professionals** from companies like ${topCompanies || "various top companies"}.\n\nYou can search by company, location, or expertise. Would you like to browse the directory?`,
        actions: ["navigate_alumni", "help_mentorship"],
        data: { alumniCount, companies: companies.slice(0, 10) },
      };
    },
  },
  {
    patterns: [/help|support|assist|guide|how.*(work|use)|what can/i],
    intent: "help",
    handler: async () => ({
      text: `🆘 Here's what I can help you with:\n\n• **Events** - Find and register for events\n• **Jobs** - Browse listings and apply\n• **Alumni** - Connect with mentors\n• **Profile** - Update your information\n• **Navigation** - Guide you around\n\nJust ask me anything!`,
      actions: ["show_events", "show_jobs", "show_alumni"],
    }),
  },
  {
    patterns: [/register|sign up|enroll.*(event)?/i],
    intent: "help.register",
    handler: async () => ({
      text: `📝 **How to Register for Events:**\n\n1. Go to the Events page\n2. Click on an event you're interested in\n3. Click the 'Register' button\n4. You'll receive a confirmation email\n\nNeed more help?`,
      actions: ["navigate_events", "contact_support"],
    }),
  },
  {
    patterns: [/apply.*(job)?|how.*(apply|application)/i],
    intent: "help.apply",
    handler: async () => ({
      text: `📄 **How to Apply for Jobs:**\n\n1. Go to the Jobs page\n2. Click on a job listing\n3. Review requirements\n4. Click 'Apply Now'\n5. Upload your resume\n\nPro tip: Keep your profile updated!`,
      actions: ["navigate_jobs", "navigate_profile"],
    }),
  },
  {
    patterns: [/mentor|mentorship|guidance|advice|coach/i],
    intent: "help.mentorship",
    handler: async () => ({
      text: `🎓 **How to Request Mentorship:**\n\n1. Browse the Alumni Directory\n2. Find an alumni in your field\n3. Click 'Request Mentorship'\n4. Write a brief introduction\n5. Wait for their response\n\nBe professional and specific!`,
      actions: ["navigate_alumni"],
    }),
  },
  {
    patterns: [/profile|update|edit.*(my|profile)|settings/i],
    intent: "navigate.profile",
    handler: async () => ({
      text: `👤 I can take you to your profile page where you can:\n\n• Update personal information\n• Add skills and experience\n• Upload a new photo\n• Connect social accounts\n\nWould you like to go there now?`,
      actions: ["navigate_profile"],
      navigate: "profile",
    }),
  },
  {
    patterns: [/contact|email|reach|support team|problem|issue/i],
    intent: "contact.support",
    handler: async () => ({
      text: `📧 You can reach our support team at:\n\n• **Email:** support@alumni-platform.com\n• **Response time:** Within 24 hours\n\nOr visit the Help Center for FAQs!`,
      actions: ["show_help"],
    }),
  },
  {
    patterns: [/thank|thanks|awesome|great|perfect|cool/i],
    intent: "gratitude",
    handler: async () => ({
      text: `You're welcome! 😊 Is there anything else I can help you with?`,
      actions: ["show_events", "show_jobs", "show_alumni", "show_help"],
    }),
  },
  {
    patterns: [/bye|goodbye|see you|later|exit/i],
    intent: "farewell",
    handler: async () => ({
      text: `Goodbye! 👋 Feel free to chat anytime you need help. Have a great day!`,
    }),
  },
  {
    patterns: [/who.*(are|r) (you|u)|what.*(are|r) (you|u)/i],
    intent: "identity",
    handler: async () => ({
      text: `I'm your AI assistant for the Alumni Association Platform! 🤖✨\n\nI can help you:\n• Find events and jobs\n• Connect with alumni\n• Navigate the platform\n• Answer questions\n\nI'm always learning to help you better!`,
      actions: ["show_help"],
    }),
  },
];

// ============================================
// PROCESS QUERY (Built-in NLP)
// ============================================
const processWithBuiltInNLP = async (text, userId, userName) => {
  const lowerText = text.toLowerCase().trim();

  // Check each pattern
  for (const { patterns, intent, handler } of intentPatterns) {
    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        const response = await handler(userId, userName);
        return {
          intent,
          confidence: 0.85,
          ...response,
        };
      }
    }
  }

  // Fallback response
  return {
    intent: "fallback",
    confidence: 0,
    text: `🤔 I'm not quite sure about that, but I'm always learning! Here are some things I can help with:\n\n• Events and registration\n• Job listings and applications\n• Alumni connections\n• Platform navigation`,
    actions: ["show_events", "show_jobs", "show_alumni", "show_help"],
  };
};

// ============================================
// MAIN QUERY HANDLER
// ============================================
const queryChatbot = asyncHandler(async (req, res) => {
  const { sessionId, text, languageCode = "en" } = req.body;
  const userId = req.user?._id;
  const userName = req.user?.name?.split(" ")[0] || "Student";

  if (!sessionId || !text) {
    res.status(400);
    throw new Error("sessionId and text are required");
  }

  let result;
  let source = "builtin";

  // Try Dialogflow first
  try {
    const dialogflowResult = await detectIntent({ sessionId, text, languageCode });
    
    if (dialogflowResult?.intentDetectionConfidence > 0.7) {
      result = {
        intent: dialogflowResult.intent?.displayName,
        confidence: dialogflowResult.intentDetectionConfidence,
        text: dialogflowResult.fulfillmentText,
        parameters: dialogflowResult.parameters,
      };
      source = "dialogflow";
    }
  } catch (error) {
    console.log("Dialogflow unavailable, using built-in NLP:", error.message);
  }

  // Fallback to built-in NLP
  if (!result || result.confidence < 0.5) {
    result = await processWithBuiltInNLP(text, userId, userName);
    source = "builtin";
  }

  res.json({
    ...result,
    source,
    sessionId,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// QUICK ACTION HANDLER
// ============================================
const handleQuickAction = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const userId = req.user?._id;
  const userName = req.user?.name?.split(" ")[0] || "Student";

  if (!action) {
    res.status(400);
    throw new Error("action is required");
  }

  const actionHandlers = {
    show_events: async () => {
      const pattern = intentPatterns.find((p) => p.intent === "event.list");
      return await pattern.handler();
    },
    show_jobs: async () => {
      const pattern = intentPatterns.find((p) => p.intent === "job.list");
      return await pattern.handler();
    },
    show_alumni: async () => {
      const pattern = intentPatterns.find((p) => p.intent === "alumni.search");
      return await pattern.handler();
    },
    show_help: async () => {
      const pattern = intentPatterns.find((p) => p.intent === "help");
      return await pattern.handler();
    },
    help_register: async () => {
      const pattern = intentPatterns.find((p) => p.intent === "help.register");
      return await pattern.handler();
    },
    help_apply: async () => {
      const pattern = intentPatterns.find((p) => p.intent === "help.apply");
      return await pattern.handler();
    },
    help_mentorship: async () => {
      const pattern = intentPatterns.find((p) => p.intent === "help.mentorship");
      return await pattern.handler();
    },
    contact_support: async () => {
      const pattern = intentPatterns.find((p) => p.intent === "contact.support");
      return await pattern.handler();
    },
    navigate_events: async () => ({
      text: "🚀 Taking you to the Events page now...",
      navigate: "events",
    }),
    navigate_jobs: async () => ({
      text: "🚀 Taking you to the Jobs page now...",
      navigate: "jobs",
    }),
    navigate_alumni: async () => ({
      text: "🚀 Taking you to the Alumni Directory now...",
      navigate: "alumni",
    }),
    navigate_profile: async () => ({
      text: "🚀 Taking you to your Profile page now...",
      navigate: "profile",
    }),
  };

  const handler = actionHandlers[action];
  
  if (!handler) {
    return res.json({
      text: "I'm not sure how to handle that action. Can I help you with something else?",
      actions: ["show_events", "show_jobs", "show_alumni", "show_help"],
    });
  }

  const result = await handler();
  res.json({
    action,
    ...result,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// WEBHOOK (Dialogflow Fulfillment)
// ============================================
const webhook = asyncHandler(async (req, res) => {
  const intent = req.body?.queryResult?.intent?.displayName || "";
  const parameters = req.body?.queryResult?.parameters || {};

  // FAQ responses
  if (faqResponses[intent]) {
    return res.json({ fulfillmentText: faqResponses[intent] });
  }

  // Event queries
  if (intent === "event.upcoming" || intent === "event.list") {
    const events = await Event.find({ 
      startAt: { $gte: new Date() }, 
      status: "published" 
    })
      .sort({ startAt: 1 })
      .limit(5)
      .lean();

    if (!events.length) {
      return res.json({ fulfillmentText: "No upcoming events right now. Check back soon!" });
    }

    const response = events
      .map((e) => `${e.title} on ${new Date(e.startAt).toDateString()}`)
      .join("; ");

    return res.json({ fulfillmentText: `📅 Upcoming events: ${response}` });
  }

  // Job queries
  if (intent === "job.latest" || intent === "job.list") {
    const jobs = await Job.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (!jobs.length) {
      return res.json({ fulfillmentText: "No active jobs at the moment." });
    }

    const response = jobs.map((j) => `${j.title} at ${j.company}`).join("; ");
    return res.json({ fulfillmentText: `💼 Recent jobs: ${response}` });
  }

  // Alumni queries
  if (intent === "alumni.search") {
    const company = parameters.company;
    const query = { role: "alumni" };
    
    if (company) {
      query.company = new RegExp(company, "i");
    }

    const count = await User.countDocuments(query);
    const text = company 
      ? `Found ${count} alumni at ${company}.`
      : `We have ${count}+ alumni in our network.`;

    return res.json({ fulfillmentText: `👥 ${text}` });
  }

  // Fallback
  return res.json({ 
    fulfillmentText: "I'm not sure about that. I can help with events, jobs, and alumni connections." 
  });
});

// ============================================
// CONVERSATION HISTORY (Optional)
// ============================================
const getConversationHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  // For now, return empty (conversation stored in frontend)
  // Can be extended to store in database
  res.json({
    sessionId,
    messages: [],
    message: "Conversation history is stored locally in your browser.",
  });
});

export { queryChatbot, handleQuickAction, webhook, getConversationHistory };
