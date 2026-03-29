/**
 * AI Chatbot Component for Student Dashboard
 * 
 * A floating AI-powered chatbot that helps students:
 * - Navigate the platform
 * - Get answers about events, jobs, alumni
 * - Receive smart suggestions
 * 
 * Features:
 * - Glassmorphism design
 * - Smooth Framer Motion animations
 * - Typing indicator
 * - Auto-scroll
 * - Context awareness
 * - Navigation routing
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Calendar,
  Briefcase,
  Users,
  HelpCircle,
  ChevronRight,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react";

// ============================================
// TYPES
// ============================================
interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  actions?: QuickAction[];
  isTyping?: boolean;
}

interface QuickAction {
  label: string;
  action: string;
  icon?: React.ReactNode;
}

interface ChatbotProps {
  studentName?: string;
  onNavigate?: (path: string) => void;
}

// ============================================
// CONSTANTS
// ============================================
const QUICK_ACTIONS: QuickAction[] = [
  { label: "Upcoming Events", action: "show_events", icon: <Calendar className="w-3.5 h-3.5" /> },
  { label: "Job Listings", action: "show_jobs", icon: <Briefcase className="w-3.5 h-3.5" /> },
  { label: "Find Alumni", action: "show_alumni", icon: <Users className="w-3.5 h-3.5" /> },
  { label: "Help", action: "show_help", icon: <HelpCircle className="w-3.5 h-3.5" /> },
];

const BOT_RESPONSES: Record<string, { text: string; actions?: QuickAction[] }> = {
  // Greetings
  greeting: {
    text: "Hello! 👋 I'm your AI assistant. I can help you with events, jobs, finding alumni, and navigating the platform. What would you like to know?",
    actions: QUICK_ACTIONS,
  },
  
  // Events
  show_events: {
    text: "📅 Here are the upcoming events:\n\n• **Tech Career Fair** - Feb 15, 2026\n• **Alumni Networking Night** - Feb 20, 2026\n• **Resume Workshop** - Feb 25, 2026\n\nWould you like me to show you more details or help you register?",
    actions: [
      { label: "View All Events", action: "navigate_events", icon: <Calendar className="w-3.5 h-3.5" /> },
      { label: "How to Register", action: "help_register" },
    ],
  },
  
  // Jobs
  show_jobs: {
    text: "💼 Here are the latest job opportunities:\n\n• **Software Engineer** at Google - Remote\n• **Data Analyst** at Microsoft - Seattle\n• **Product Manager** at Meta - Menlo Park\n\nI can help you apply or find more jobs matching your skills!",
    actions: [
      { label: "View All Jobs", action: "navigate_jobs", icon: <Briefcase className="w-3.5 h-3.5" /> },
      { label: "How to Apply", action: "help_apply" },
    ],
  },
  
  // Alumni
  show_alumni: {
    text: "👥 Our alumni network includes professionals from top companies:\n\n• 50+ at Google\n• 35+ at Microsoft\n• 40+ at Amazon\n• 25+ at Meta\n\nYou can search by company, location, or field of expertise!",
    actions: [
      { label: "Browse Alumni", action: "navigate_alumni", icon: <Users className="w-3.5 h-3.5" /> },
      { label: "Request Mentorship", action: "help_mentorship" },
    ],
  },
  
  // Help
  show_help: {
    text: "🆘 Here's what I can help you with:\n\n• **Events** - Find and register for events\n• **Jobs** - Browse job listings and apply\n• **Alumni** - Connect with alumni mentors\n• **Profile** - Update your information\n• **Navigation** - Guide you around the platform\n\nJust ask me anything!",
    actions: QUICK_ACTIONS,
  },
  
  // Navigation helpers
  navigate_events: {
    text: "🚀 Taking you to the Events page now...",
  },
  navigate_jobs: {
    text: "🚀 Taking you to the Jobs page now...",
  },
  navigate_alumni: {
    text: "🚀 Taking you to the Alumni Directory now...",
  },
  navigate_profile: {
    text: "🚀 Taking you to your Profile page now...",
  },
  
  // Help topics
  help_register: {
    text: "📝 **How to Register for Events:**\n\n1. Go to the Events page\n2. Click on an event you're interested in\n3. Click the 'Register' button\n4. You'll receive a confirmation email\n\nNeed more help?",
    actions: [
      { label: "Go to Events", action: "navigate_events" },
      { label: "Contact Support", action: "contact_support" },
    ],
  },
  help_apply: {
    text: "📄 **How to Apply for Jobs:**\n\n1. Go to the Jobs page\n2. Click on a job listing\n3. Review the requirements\n4. Click 'Apply Now'\n5. Upload your resume and fill in details\n\nPro tip: Keep your profile updated for better matches!",
    actions: [
      { label: "Go to Jobs", action: "navigate_jobs" },
      { label: "Update Profile", action: "navigate_profile" },
    ],
  },
  help_mentorship: {
    text: "🎓 **How to Request Mentorship:**\n\n1. Browse the Alumni Directory\n2. Find an alumni in your field of interest\n3. Click 'Request Mentorship'\n4. Write a brief introduction about yourself\n5. Wait for their response\n\nRemember to be professional and specific about what you want to learn!",
    actions: [
      { label: "Browse Alumni", action: "navigate_alumni" },
    ],
  },
  
  // Support
  contact_support: {
    text: "📧 You can reach our support team at:\n\n• Email: support@alumni-platform.com\n• Response time: Within 24 hours\n\nOr you can visit the Help Center for FAQs!",
  },
  
  // Fallback
  fallback: {
    text: "🤔 I'm not quite sure about that, but I'm always learning! Here are some things I can help with:",
    actions: QUICK_ACTIONS,
  },
};

// AI response patterns for natural language understanding
const AI_PATTERNS: Array<{ patterns: RegExp[]; response: string }> = [
  {
    patterns: [/hello|hi|hey|good morning|good afternoon|good evening/i],
    response: "greeting",
  },
  {
    patterns: [/event|upcoming|happening|conference|workshop|webinar|meetup/i],
    response: "show_events",
  },
  {
    patterns: [/job|career|work|hiring|position|opening|internship|apply/i],
    response: "show_jobs",
  },
  {
    patterns: [/alumni|mentor|connect|network|professional|graduate/i],
    response: "show_alumni",
  },
  {
    patterns: [/help|support|assist|guide|how to|what can/i],
    response: "show_help",
  },
  {
    patterns: [/register|sign up|enroll/i],
    response: "help_register",
  },
  {
    patterns: [/mentorship|mentor me|guidance|advice/i],
    response: "help_mentorship",
  },
  {
    patterns: [/contact|email|reach|support team/i],
    response: "contact_support",
  },
  {
    patterns: [/profile|update|edit my|settings/i],
    response: "navigate_profile",
  },
  {
    patterns: [/thank|thanks|awesome|great|perfect/i],
    response: "thanks",
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================
const generateId = () => Math.random().toString(36).substring(2, 9);

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const parseMarkdown = (text: string) => {
  // Simple markdown parser for bold text and line breaks
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\n/g, "<br />");
};

// ============================================
// TYPING INDICATOR COMPONENT
// ============================================
const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-blue-400 rounded-full"
        animate={{
          y: [0, -6, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// ============================================
// MESSAGE BUBBLE COMPONENT
// ============================================
const MessageBubble = ({
  message,
  onAction,
}: {
  message: Message;
  onAction: (action: string) => void;
}) => {
  const isBot = message.type === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[80%] ${isBot ? "" : "order-first"}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isBot
              ? "bg-white/10 backdrop-blur-sm rounded-tl-sm"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 rounded-tr-sm"
          }`}
        >
          {message.isTyping ? (
            <TypingIndicator />
          ) : (
            <p
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
            />
          )}
        </div>

        {/* Quick Actions */}
        {message.actions && message.actions.length > 0 && !message.isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mt-2"
          >
            {message.actions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAction(action.action)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
              >
                {action.icon}
                {action.label}
                <ChevronRight className="w-3 h-3 opacity-50" />
              </motion.button>
            ))}
          </motion.div>
        )}

        <p className={`text-[10px] text-white/40 mt-1 ${isBot ? "text-left" : "text-right"}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// MAIN CHATBOT COMPONENT
// ============================================
export default function AIChatbot({ studentName = "Student", onNavigate }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Send welcome message when chat first opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: generateId(),
        type: "bot",
        content: `Hi ${studentName}! 👋 I'm your AI assistant. I can help you discover events, find jobs, connect with alumni, and navigate the platform. What would you like to explore today?`,
        timestamp: new Date(),
        actions: QUICK_ACTIONS,
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, studentName, messages.length]);

  // Process user input and get bot response
  const processInput = useCallback((input: string): string => {
    const lowerInput = input.toLowerCase().trim();

    // Check for pattern matches
    for (const { patterns, response } of AI_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(lowerInput)) {
          return response;
        }
      }
    }

    return "fallback";
  }, []);

  // Handle navigation
  const handleNavigation = useCallback(
    (action: string) => {
      const navMap: Record<string, string> = {
        navigate_events: "events",
        navigate_jobs: "jobs",
        navigate_alumni: "alumni",
        navigate_profile: "profile",
      };

      if (navMap[action] && onNavigate) {
        setTimeout(() => onNavigate(navMap[action]), 500);
      }
    },
    [onNavigate]
  );

  // Add bot response
  const addBotResponse = useCallback(
    (responseKey: string) => {
      setIsTyping(true);

      // Simulate typing delay
      setTimeout(() => {
        const response = BOT_RESPONSES[responseKey] || BOT_RESPONSES.fallback;
        
        // Handle special "thanks" response
        let content = response.text;
        if (responseKey === "thanks") {
          content = "You're welcome! 😊 Is there anything else I can help you with?";
        }

        const botMessage: Message = {
          id: generateId(),
          type: "bot",
          content,
          timestamp: new Date(),
          actions: response.actions,
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);

        // Handle navigation actions
        if (responseKey.startsWith("navigate_")) {
          handleNavigation(responseKey);
        }

        // Notification for new message when minimized
        if (isMinimized) {
          setHasNewMessage(true);
        }
      }, 800 + Math.random() * 700); // Random delay for natural feel
    },
    [handleNavigation, isMinimized]
  );

  // Handle sending a message
  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Process and respond
    const responseKey = processInput(inputValue);
    addBotResponse(responseKey);
  }, [inputValue, processInput, addBotResponse]);

  // Handle quick action clicks
  const handleAction = useCallback(
    (action: string) => {
      // Add user message showing what they clicked
      const actionLabels: Record<string, string> = {
        show_events: "Show me upcoming events",
        show_jobs: "Show me job listings",
        show_alumni: "Help me find alumni",
        show_help: "What can you help me with?",
        navigate_events: "Take me to Events",
        navigate_jobs: "Take me to Jobs",
        navigate_alumni: "Take me to Alumni Directory",
        navigate_profile: "Take me to my Profile",
        help_register: "How do I register for events?",
        help_apply: "How do I apply for jobs?",
        help_mentorship: "How do I request mentorship?",
        contact_support: "How do I contact support?",
      };

      if (actionLabels[action]) {
        const userMessage: Message = {
          id: generateId(),
          type: "user",
          content: actionLabels[action],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
      }

      addBotResponse(action);
    },
    [addBotResponse]
  );

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    setHasNewMessage(false);
  };

  // Toggle minimize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setHasNewMessage(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center z-50 group"
            style={{
              boxShadow: "0 0 30px rgba(139, 92, 246, 0.4), 0 10px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <MessageCircle className="w-6 h-6 text-white relative z-10" />
            
            {/* Sparkle effect */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : 600,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-96 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
            style={{
              boxShadow: "0 0 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(139, 92, 246, 0.1)",
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      AI Assistant
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </h3>
                    <p className="text-xs text-white/60">Always here to help</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleMinimize}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    {isMinimized ? (
                      <Maximize2 className="w-4 h-4" />
                    ) : (
                      <Minimize2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={toggleChat}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* New message indicator */}
              {hasNewMessage && isMinimized && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-300"
                >
                  You have a new message!
                </motion.div>
              )}
            </div>

            {/* Messages Area */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 400 }}>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} onAction={handleAction} />
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3">
                          <TypingIndicator />
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask me anything..."
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-white/30"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className={`p-3 rounded-xl transition-all ${
                          inputValue.trim()
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                            : "bg-white/10 text-white/40 cursor-not-allowed"
                        }`}
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Powered by badge */}
                    <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-white/30">
                      <Sparkles className="w-3 h-3" />
                      Powered by AI
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
