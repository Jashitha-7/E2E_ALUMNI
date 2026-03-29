/**
 * Alumni Dashboard Page
 * 
 * A comprehensive dashboard for alumni featuring:
 * - Overview with stats and activity feed
 * - Student directory with mentorship management
 * - Job posting and applicant management
 * - Events participation and creation
 * - Real-time chat with students
 * - Profile management
 * 
 * Features:
 * - Glassmorphism design
 * - 3D tilt effects
 * - Framer Motion animations
 * - Socket.io integration ready
 */

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Home,
  Users,
  Briefcase,
  Calendar,
  MessageCircle,
  User,
  Bell,
  Search,
  Settings,
  ChevronRight,
  ChevronLeft,
  MapPin,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Zap,
  CheckCircle,
  Clock,
  Building2,
  Plus,
  Edit3,
  Trash2,
  Award,
  UserPlus,
  UserCheck,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Camera,
  X,
  Check,
  MessageSquare,
  Video,
  FileText,
  LogOut,
} from "lucide-react";
import RealtimeChatPanel from "../components/chatbot/RealtimeChatPanel";
import { getApiBase } from "../lib/apiBase";

// ============================================
// TYPES
// ============================================
type NavItem = "overview" | "students" | "jobs" | "events" | "chat" | "profile";

interface Student {
  id: string | number;
  name: string;
  email: string;
  avatar: string;
  batch: string;
  major: string;
  skills: string[];
  status: "pending" | "mentee" | "none";
  gpa?: number;
  interests: string[];
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "internship" | "contract";
  salary: string;
  description: string;
  requirements: string[];
  applicants: number;
  posted: string;
  status: "active" | "closed" | "draft";
}

interface Applicant {
  id: number;
  name: string;
  email: string;
  avatar: string;
  batch: string;
  major: string;
  appliedDate: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  resumeUrl?: string;
  coverLetter?: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: "workshop" | "networking" | "seminar" | "career-fair";
  attendees: number;
  maxAttendees: number;
  isRegistered: boolean;
  isCreator: boolean;
}

// ============================================
// REUSABLE COMPONENTS
// ============================================

// 3D Tilt Card Component
function TiltCard({
  children,
  className = "",
  intensity = 15,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-intensity, intensity]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GlassCard({
  children,
  className = "",
  hover = true,
  gradient = "from-white/10 to-white/5",
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: string;
}) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      className={`rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const increment = Math.max(1, Math.ceil(value / 30));
    const timer = window.setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        window.clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 20);

    return () => window.clearInterval(timer);
  }, [value]);

  return <>{count}</>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    mentee: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    none: "bg-white/10 text-white/70 border-white/20",
    active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    closed: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    reviewed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    accepted: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    rejected: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${styles[status] || "bg-white/10 text-white/70 border-white/20"}`}>
      {label}
    </span>
  );
}

export default function AlumniDashboardPage() {
  const [activeNav, setActiveNav] = useState<NavItem>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications] = useState(3);

  const sidebarWidth = sidebarCollapsed ? 80 : 280;

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "students", label: "Students", icon: Users },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "events", label: "Events", icon: Calendar },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "profile", label: "Profile", icon: User },
  ] as const;

  const storedUser = localStorage.getItem("alumniUser") || localStorage.getItem("user") || "";
  let fullName = "Alumni User";
  let subtitle = "Alumni";

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser) as { name?: string; role?: string; company?: string };
      if (parsed.name) fullName = parsed.name;
      if (parsed.company) subtitle = parsed.company;
      else if (parsed.role) subtitle = parsed.role;
    } catch {
      // no-op
    }
  }

  const firstName = fullName.split(" ")[0] || "Alumni";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "AL";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 text-white">
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen bg-slate-900/50 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col"
      >
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="font-bold">Alumni Hub</p>
                <p className="text-xs text-white/50">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1.5">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeNav === item.id
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                  : "hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.hash = "#/login";
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && "Sign Out"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
          </motion.button>
        </div>
      </motion.aside>

      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="min-h-screen"
      >
        <header className="sticky top-0 z-40 bg-slate-900/50 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search students, jobs, events..."
                className="w-full !pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveNav("profile")}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                  {initials}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{fullName}</p>
                  <p className="text-xs text-white/40">{subtitle}</p>
                </div>
              </motion.button>
            </div>
          </div>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeNav === "overview" && <OverviewPanel key="overview" alumniFirstName={firstName} />}
            {activeNav === "students" && <StudentsPanel key="students" />}
            {activeNav === "jobs" && <JobsPanel key="jobs" />}
            {activeNav === "events" && <EventsPanel key="events" />}
            {activeNav === "chat" && <ChatPanel key="chat" />}
            {activeNav === "profile" && <ProfilePanel key="profile" />}
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}

// ============================================
// OVERVIEW PANEL
// ============================================
function OverviewPanel({ alumniFirstName }: { alumniFirstName: string }) {
  const [pendingRequests, setPendingRequests] = useState<Array<{
    id: string;
    name: string;
    avatar: string;
    batch: string;
    major: string;
    message: string;
  }>>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const stats = [
    { label: "Mentorship Requests", value: 12, icon: UserPlus, color: "from-purple-500 to-pink-500", change: "+5", up: true },
    { label: "Active Mentees", value: 8, icon: UserCheck, color: "from-blue-500 to-cyan-400", change: "+2", up: true },
    { label: "Job Applicants", value: 45, icon: Briefcase, color: "from-emerald-500 to-teal-400", change: "+18", up: true },
    { label: "Messages", value: 23, icon: MessageCircle, color: "from-orange-500 to-amber-400", change: "+7", up: true },
  ];

  const recentActivity = [
    { type: "mentorship", text: "John Student requested mentorship", time: "2 mins ago", icon: UserPlus, color: "text-purple-400" },
    { type: "application", text: "Sarah applied for SWE Intern position", time: "15 mins ago", icon: FileText, color: "text-blue-400" },
    { type: "message", text: "New message from Mike Chen", time: "1 hour ago", icon: MessageSquare, color: "text-emerald-400" },
    { type: "event", text: "Tech Career Fair starting soon", time: "2 hours ago", icon: Calendar, color: "text-orange-400" },
    { type: "application", text: "3 new applicants for PM role", time: "3 hours ago", icon: Briefcase, color: "text-pink-400" },
  ];

  const metaEnv = (import.meta as { env?: { VITE_API_URL?: string } }).env;
  const apiBase = metaEnv?.VITE_API_URL ?? "/api/v1";

  const getStoredAccessToken = () =>
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";

  const loadRequests = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setRequestsError("Please login again.");
      setPendingRequests([]);
      return;
    }

    try {
      setRequestsLoading(true);
      setRequestsError(null);

      const response = await fetch(`${apiBase}/alumni/mentorship/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const raw = await response.text();
      const payload = raw ? JSON.parse(raw) : null;

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load mentorship requests");
      }

      const mapped = (payload?.data || []).map((request: {
        _id: string;
        message?: string;
        sender?: { name?: string; department?: string; graduationYear?: number };
      }) => ({
        id: request._id,
        name: request.sender?.name || "Student",
        avatar: (request.sender?.name || "S")
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part: string) => part[0]?.toUpperCase() || "")
          .join("") || "ST",
        batch: request.sender?.graduationYear ? String(request.sender.graduationYear) : "N/A",
        major: request.sender?.department || "Student",
        message: request.message || "Mentorship request",
      }));

      setPendingRequests(mapped);
    } catch (error) {
      setRequestsError(error instanceof Error ? error.message : "Failed to load mentorship requests");
      setPendingRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, [apiBase]);

  const handleRequestAction = useCallback(async (requestId: string, action: "accept" | "decline") => {
    const token = getStoredAccessToken();
    if (!token) {
      setRequestsError("Please login again.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/alumni/mentorship/${action}/${requestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: action === "decline" ? JSON.stringify({ reason: "Not available at the moment" }) : undefined,
      });

      const raw = await response.text();
      const payload = raw ? JSON.parse(raw) : null;

      if (!response.ok) {
        throw new Error(payload?.message || `Failed to ${action} request`);
      }

      setPendingRequests((prev) => prev.filter((item) => item.id !== requestId));
    } catch (error) {
      setRequestsError(error instanceof Error ? error.message : `Failed to ${action} request`);
    }
  }, [apiBase]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold mb-2"
            >
              Welcome back, {alumniFirstName}! 👋
            </motion.h1>
            <p className="text-white/60">Here's what's happening in your alumni network</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-6xl"
          >
            🎓
          </motion.div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <TiltCard key={stat.label} intensity={10}>
            <GlassCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                  {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-3xl font-bold mb-1"
              >
                <AnimatedCounter value={stat.value} />
              </motion.p>
              <p className="text-white/60 text-sm">{stat.label}</p>
            </GlassCard>
          </TiltCard>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Mentorship Requests */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Pending Mentorship Requests
            </h2>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {requestsLoading && <p className="text-sm text-white/60">Loading requests...</p>}
            {requestsError && <p className="text-sm text-rose-300">{requestsError}</p>}
            {!requestsLoading && !requestsError && pendingRequests.length === 0 && (
              <p className="text-sm text-white/50">No pending mentorship requests.</p>
            )}
            {pendingRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="text-4xl">{request.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{request.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      {request.batch}
                    </span>
                  </div>
                  <p className="text-sm text-white/60">{request.major}</p>
                  <p className="text-sm text-white/40 truncate mt-1">"{request.message}"</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => void handleRequestAction(request.id, "accept")}
                    className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => void handleRequestAction(request.id, "decline")}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Recent Activity
          </h2>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className={`p-2 rounded-lg bg-white/5 ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-white/40">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Post a Job", icon: Briefcase, color: "from-blue-500 to-cyan-400" },
          { label: "Create Event", icon: Calendar, color: "from-purple-500 to-pink-500" },
          { label: "Message Students", icon: MessageCircle, color: "from-emerald-500 to-teal-400" },
          { label: "View Applications", icon: FileText, color: "from-orange-500 to-amber-400" },
        ].map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl bg-gradient-to-r ${action.color} flex items-center gap-3 font-medium shadow-lg`}
          >
            <action.icon className="w-5 h-5" />
            {action.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// STUDENTS PANEL
// ============================================
function StudentsPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBatch, setFilterBatch] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const metaEnv = (import.meta as { env?: { VITE_API_URL?: string } }).env;
  const apiBase = metaEnv?.VITE_API_URL ?? "/api/v1";

  const getStoredAccessToken = () =>
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      setLoadError("Please login again to view students.");
      setStudents([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const params = new URLSearchParams({
          limit: "100",
          search: searchQuery,
          ...(filterBatch !== "all" ? { year: filterBatch } : {}),
        });

        const response = await fetch(`${apiBase}/alumni/students?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const raw = await response.text();
        const payload = raw ? JSON.parse(raw) : null;

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load students");
        }

        const mapped = (payload?.data?.students || []).map((item: {
          _id: string;
          name?: string;
          email?: string;
          department?: string;
          graduationYear?: number;
          skills?: string[];
        }) => {
          const initials = (item.name || "S")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part: string) => part[0]?.toUpperCase() || "")
            .join("");

          return {
            id: item._id,
            name: item.name || "Student",
            email: item.email || "",
            avatar: initials || "ST",
            batch: item.graduationYear ? String(item.graduationYear) : "N/A",
            major: item.department || "Student",
            skills: Array.isArray(item.skills) ? item.skills : [],
            status: "none" as const,
            interests: [],
          };
        });

        setStudents(mapped);
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") return;
        setLoadError(error instanceof Error ? error.message : "Failed to load students");
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [apiBase, filterBatch, searchQuery]);

  const filteredStudents = students;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Student Directory</h1>
          <p className="text-white/60">Connect with students and manage mentorships</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50 w-64"
            />
          </div>
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Batches</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && (
          <div className="col-span-full text-center text-white/60 py-10">Loading students...</div>
        )}
        {loadError && !isLoading && (
          <div className="col-span-full text-center text-rose-300 py-10">{loadError}</div>
        )}
        {!isLoading && !loadError && filteredStudents.length === 0 && (
          <div className="col-span-full text-center text-white/50 py-10">No students found.</div>
        )}
        {filteredStudents.map((student, index) => (
          <TiltCard key={student.id} intensity={8}>
            <GlassCard className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{student.avatar}</div>
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-sm text-white/60">{student.major}</p>
                    </div>
                  </div>
                  <StatusBadge status={student.status} />
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <GraduationCap className="w-4 h-4" />
                    Batch of {student.batch}
                  </div>
                  {student.gpa && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Star className="w-4 h-4 text-yellow-400" />
                      GPA: {student.gpa}
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {student.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2.5 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {student.skills.length > 3 && (
                    <span className="px-2.5 py-1 text-xs bg-white/10 text-white/60 rounded-full">
                      +{student.skills.length - 3}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStudent(student)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                  >
                    View Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </motion.button>
                  {student.status === "pending" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    >
                      <UserCheck className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </GlassCard>
          </TiltCard>
        ))}
      </div>

      {/* Student Profile Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{selectedStudent.avatar}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                    <p className="text-white/60">{selectedStudent.major}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={selectedStudent.status} />
                      <span className="text-sm text-white/40">Batch of {selectedStudent.batch}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm text-white/40 mb-2">Contact</h3>
                  <p className="text-sm">{selectedStudent.email}</p>
                </div>
                <div>
                  <h3 className="text-sm text-white/40 mb-2">GPA</h3>
                  <p className="text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    {selectedStudent.gpa}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm text-white/40 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 text-sm bg-purple-500/20 text-purple-300 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm text-white/40 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.interests.map(interest => (
                    <span key={interest} className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-300 rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-medium"
                >
                  <MessageSquare className="w-5 h-5 inline mr-2" />
                  Send Message
                </motion.button>
                {selectedStudent.status === "pending" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium"
                  >
                    <UserCheck className="w-5 h-5 inline mr-2" />
                    Accept Mentorship
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// JOBS PANEL
// ============================================
function JobsPanel() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "draft" | "closed">("active");

  const [newJob, setNewJob] = useState({
    title: "",
    company: "Google",
    location: "",
    type: "full-time",
    salary: "",
    description: "",
    requirements: "",
  });

  const jobs: Job[] = [
    { id: 1, title: "Software Engineer Intern", company: "Google", location: "Mountain View, CA", type: "internship", salary: "$8,000/month", description: "Join our team...", requirements: ["React", "Python"], applicants: 23, posted: "2 days ago", status: "active" },
    { id: 2, title: "Product Manager", company: "Google", location: "Remote", type: "full-time", salary: "$150k - $200k", description: "Lead product...", requirements: ["Product", "Agile"], applicants: 15, posted: "1 week ago", status: "active" },
    { id: 3, title: "Data Analyst", company: "Google", location: "New York, NY", type: "full-time", salary: "$120k - $160k", description: "Analyze data...", requirements: ["SQL", "Python"], applicants: 8, posted: "3 days ago", status: "draft" },
    { id: 4, title: "UX Designer", company: "Google", location: "San Francisco, CA", type: "contract", salary: "$90/hour", description: "Design user...", requirements: ["Figma", "Research"], applicants: 31, posted: "2 weeks ago", status: "closed" },
  ];

  const applicants: Applicant[] = [
    { id: 1, name: "John Student", email: "john@university.edu", avatar: "🧑‍🎓", batch: "2026", major: "Computer Science", appliedDate: "Jan 28", status: "pending" },
    { id: 2, name: "Emily Chen", email: "emily@university.edu", avatar: "👩‍🎓", batch: "2025", major: "Data Science", appliedDate: "Jan 27", status: "reviewed" },
    { id: 3, name: "Alex Kumar", email: "alex@university.edu", avatar: "🧑‍💻", batch: "2026", major: "Software Engineering", appliedDate: "Jan 26", status: "accepted" },
    { id: 4, name: "Sarah Williams", email: "sarah@university.edu", avatar: "👩‍💻", batch: "2025", major: "Computer Science", appliedDate: "Jan 25", status: "rejected" },
  ];

  const filteredJobs = jobs.filter(job => job.status === activeTab);

  const handleViewApplicants = (job: Job) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Job Management</h1>
          <p className="text-white/60">Post jobs and manage applications</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["active", "draft", "closed"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab 
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="ml-2 px-2 py-0.5 text-xs bg-white/10 rounded-full">
              {jobs.filter(j => j.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <StatusBadge status={job.status} />
                    <span className="px-2.5 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                      {job.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {job.posted}
                    </span>
                  </div>
                  <p className="text-white/40 mt-2">{job.salary}</p>
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewApplicants(job)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    {job.applicants} Applicants
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Create Job Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Post New Job</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="e.g., Software Engineer Intern"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Location</label>
                    <input
                      type="text"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      placeholder="e.g., Remote / San Francisco"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Job Type</label>
                    <select
                      value={newJob.type}
                      onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Salary Range</label>
                  <input
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    placeholder="e.g., $100k - $150k / year"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Description</label>
                  <textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="Describe the role and responsibilities..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Requirements (comma-separated)</label>
                  <input
                    type="text"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    placeholder="e.g., React, Node.js, 2+ years experience"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-medium transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 font-medium"
                  >
                    Save as Draft
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-medium"
                  >
                    Post Job
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applicants Modal */}
      <AnimatePresence>
        {showApplicantsModal && selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApplicantsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                  <p className="text-white/60">{selectedJob.applicants} Applicants</p>
                </div>
                <button
                  onClick={() => setShowApplicantsModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {applicants.map((applicant, index) => (
                  <motion.div
                    key={applicant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="text-4xl">{applicant.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{applicant.name}</p>
                        <StatusBadge status={applicant.status} />
                      </div>
                      <p className="text-sm text-white/60">{applicant.major} • Batch {applicant.batch}</p>
                      <p className="text-xs text-white/40">Applied {applicant.appliedDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        title="View Resume"
                      >
                        <FileText className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                        title="Message"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </motion.button>
                      {applicant.status === "pending" && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="Accept"
                          >
                            <Check className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// EVENTS PANEL
// ============================================
function EventsPanel() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "my-events">("upcoming");

  const events: Event[] = [
    { id: 1, title: "Tech Career Fair 2026", description: "Annual career fair with top tech companies", date: "Feb 15, 2026", time: "10:00 AM - 4:00 PM", location: "Main Campus Hall", type: "career-fair", attendees: 156, maxAttendees: 300, isRegistered: true, isCreator: false },
    { id: 2, title: "Alumni Networking Night", description: "Connect with fellow alumni and share experiences", date: "Feb 20, 2026", time: "6:00 PM - 9:00 PM", location: "Downtown Conference Center", type: "networking", attendees: 78, maxAttendees: 100, isRegistered: false, isCreator: false },
    { id: 3, title: "Resume Writing Workshop", description: "Learn how to craft a standout resume", date: "Feb 25, 2026", time: "2:00 PM - 4:00 PM", location: "Virtual (Zoom)", type: "workshop", attendees: 45, maxAttendees: 100, isRegistered: true, isCreator: true },
    { id: 4, title: "AI/ML Seminar Series", description: "Deep dive into latest AI trends", date: "Mar 1, 2026", time: "3:00 PM - 5:00 PM", location: "Engineering Building Room 101", type: "seminar", attendees: 89, maxAttendees: 150, isRegistered: false, isCreator: false },
  ];

  const typeColors: Record<string, string> = {
    "career-fair": "bg-purple-500/20 text-purple-400",
    "networking": "bg-blue-500/20 text-blue-400",
    "workshop": "bg-emerald-500/20 text-emerald-400",
    "seminar": "bg-orange-500/20 text-orange-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Events</h1>
          <p className="text-white/60">Join or create events for the community</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["upcoming", "past", "my-events"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab 
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {tab === "my-events" ? "My Events" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event, index) => (
          <TiltCard key={event.id} intensity={6}>
            <GlassCard className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${typeColors[event.type]}`}>
                    {event.type.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </span>
                  {event.isCreator && (
                    <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                      Your Event
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-sm text-white/60 mb-4">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Calendar className="w-4 h-4" />
                    {event.date} • {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Users className="w-4 h-4" />
                    {event.attendees} / {event.maxAttendees} attendees
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>

                <div className="flex gap-2">
                  {event.isCreator ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                      >
                        <Edit3 className="w-4 h-4 inline mr-2" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-purple-500/20 text-purple-400 text-sm font-medium transition-colors"
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        View Attendees
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        event.isRegistered
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                      }`}
                    >
                      {event.isRegistered ? (
                        <>
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                          Registered
                        </>
                      ) : (
                        "Register Now"
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </GlassCard>
          </TiltCard>
        ))}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Create Event</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Tech Career Workshop"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Virtual (Zoom) / Campus Hall"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Event Type</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50">
                      <option value="workshop">Workshop</option>
                      <option value="networking">Networking</option>
                      <option value="seminar">Seminar</option>
                      <option value="career-fair">Career Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Max Attendees</label>
                    <input
                      type="number"
                      placeholder="100"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Description</label>
                  <textarea
                    placeholder="Describe your event..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-medium transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-medium"
                  >
                    Create Event
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// CHAT PANEL
// ============================================
function ChatPanel() {
  return <RealtimeChatPanel />;
}

// ============================================
// PROFILE PANEL
// ============================================
function ProfilePanel() {
  const apiBase = getApiBase();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: "Sarah Alumni",
    email: "sarah.alumni@gmail.com",
    phone: "+1 (555) 987-6543",
    company: "Google",
    role: "Senior Software Engineer",
    experience: "8 years",
    batch: "2018",
    location: "San Francisco, CA",
    bio: "Passionate about mentoring the next generation of tech leaders. Specialized in distributed systems and machine learning. Previously at Meta and Amazon.",
    skills: ["System Design", "Machine Learning", "Python", "Go", "Kubernetes", "Leadership"],
    linkedin: "linkedin.com/in/sarahalumni",
    github: "github.com/sarahalumni",
    portfolio: "sarahalumni.dev",
  });

  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const accessToken = localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await fetch(`${apiBase}/alumni/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const payload = data?.data;
        if (!mounted || !payload) return;

        setProfile((prev) => ({
          ...prev,
          name: payload.name || prev.name,
          email: payload.email || prev.email,
          phone: payload.phone || prev.phone,
          company: payload.currentCompany || prev.company,
          role: payload.currentRole || prev.role,
          experience: payload.experience || prev.experience,
          batch: payload.graduationYear ? String(payload.graduationYear) : prev.batch,
          location: payload.location || prev.location,
          bio: payload.bio || prev.bio,
          skills: Array.isArray(payload.skills) && payload.skills.length ? payload.skills : prev.skills,
          linkedin: payload.linkedin || prev.linkedin,
          github: payload.github || prev.github,
          portfolio: payload.portfolio || prev.portfolio,
        }));
      } catch {
        // keep fallback profile values
      }
    };

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [apiBase]);

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const stats = [
    { label: "Mentees", value: 8, icon: UserCheck },
    { label: "Jobs Posted", value: 12, icon: Briefcase },
    { label: "Events Hosted", value: 5, icon: Calendar },
    { label: "Messages", value: 156, icon: MessageCircle },
  ];

  const handleEditToggle = async () => {
    if (!isEditing) {
      setStatusMessage(null);
      setIsEditing(true);
      return;
    }

    const accessToken = localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
    if (!accessToken) {
      setStatusMessage("Please login again to save changes.");
      return;
    }

    try {
      setIsSaving(true);
      setStatusMessage(null);

      const response = await fetch(`${apiBase}/alumni/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          currentCompany: profile.company,
          currentRole: profile.role,
          experience: profile.experience,
          graduationYear: Number(profile.batch) || undefined,
          location: profile.location,
          bio: profile.bio,
          skills: profile.skills,
          linkedin: profile.linkedin,
          github: profile.github,
          portfolio: profile.portfolio,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to save profile changes");
      }

      const updated = payload?.data;
      if (updated) {
        setProfile((prev) => ({
          ...prev,
          name: updated.name || prev.name,
          phone: updated.phone || "",
          company: updated.currentCompany || "",
          role: updated.currentRole || "",
          experience: updated.experience || "",
          batch: updated.graduationYear ? String(updated.graduationYear) : prev.batch,
          location: updated.location || "",
          bio: updated.bio || "",
          skills: Array.isArray(updated.skills) ? updated.skills : prev.skills,
          linkedin: updated.linkedin || "",
          github: updated.github || "",
          portfolio: updated.portfolio || "",
        }));
      }

      setIsEditing(false);
      setStatusMessage("Profile updated successfully.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 max-w-5xl mx-auto px-1 md:px-2"
    >
      {/* Header Card */}
      <GlassCard className="p-8 md:p-10" hover={false}>
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold shadow-2xl shadow-purple-500/25">
              SA
            </div>
            {isEditing && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-8 h-8" />
              </motion.button>
            )}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="text-3xl font-bold bg-transparent border-b border-white/20 focus:border-purple-500 focus:outline-none mb-2"
                  />
                ) : (
                  <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                )}
                <div className="flex items-center gap-2 text-white/60 flex-wrap">
                  <Building2 className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      className="bg-transparent border-b border-white/20 focus:border-purple-500 focus:outline-none text-sm"
                    />
                  ) : (
                    <span>{profile.role}</span>
                  )}
                  <span>@</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      className="bg-transparent border-b border-white/20 focus:border-purple-500 focus:outline-none text-sm"
                    />
                  ) : (
                    <span>{profile.company}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-white/40 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    Batch of {profile.batch}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {profile.experience} experience
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  void handleEditToggle();
                }}
                disabled={isSaving}
                className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 ${
                  isEditing 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {isEditing ? (
                  <>
                    <Check className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </motion.button>
            </div>
            {statusMessage && (
              <p className="mt-5 text-sm text-white/70">{statusMessage}</p>
            )}

            {/* Stats Row */}
            <div className="flex gap-4 md:gap-8 mt-7 flex-wrap">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                    <stat.icon className="w-5 h-5 text-purple-400" />
                    {stat.value}
                  </div>
                  <p className="text-xs text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Bio & About */}
        <GlassCard className="lg:col-span-2 p-7 md:p-8">
          <h2 className="text-lg font-bold mb-5">About</h2>
          {isEditing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
            />
          ) : (
            <p className="text-white/70 leading-relaxed">{profile.bio}</p>
          )}

          {/* Skills */}
          <h3 className="text-lg font-bold mt-8 mb-5">Skills & Expertise</h3>
          <div className="flex flex-wrap gap-3">
            {profile.skills.map((skill) => (
              <motion.span
                key={skill}
                layout
                className={`px-3.5 py-2 rounded-full text-sm ${
                  isEditing
                    ? "bg-purple-500/20 text-purple-300 cursor-pointer hover:bg-red-500/20 hover:text-red-300"
                    : "bg-purple-500/20 text-purple-300"
                }`}
                onClick={() => isEditing && removeSkill(skill)}
              >
                {skill}
                {isEditing && <X className="w-3 h-3 inline ml-1" />}
              </motion.span>
            ))}
            {isEditing && (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Add skill"
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50 w-36"
                />
                <button
                  onClick={addSkill}
                  className="p-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Contact & Links */}
        <GlassCard className="p-7 md:p-8">
          <h2 className="text-lg font-bold mb-5">Contact</h2>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-white/5">
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 focus:border-purple-500 focus:outline-none text-sm"
                  />
                ) : (
                  <p className="text-sm truncate">{profile.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-white/5">
                <Phone className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">Phone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 focus:border-purple-500 focus:outline-none text-sm"
                  />
                ) : (
                  <p className="text-sm">{profile.phone}</p>
                )}
              </div>
            </div>

            <hr className="border-white/10 my-2" />

            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-white/5">
                <Linkedin className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">LinkedIn</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 focus:border-purple-500 focus:outline-none text-sm"
                  />
                ) : (
                  <a href={`https://${profile.linkedin}`} className="text-sm text-blue-400 hover:underline truncate block">
                    {profile.linkedin}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-white/5">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">GitHub</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.github}
                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 focus:border-purple-500 focus:outline-none text-sm"
                  />
                ) : (
                  <a href={`https://${profile.github}`} className="text-sm text-white/80 hover:underline truncate block">
                    {profile.github}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-white/5">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">Portfolio</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.portfolio}
                    onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 focus:border-purple-500 focus:outline-none text-sm"
                  />
                ) : (
                  <a href={`https://${profile.portfolio}`} className="text-sm text-emerald-400 hover:underline truncate block">
                    {profile.portfolio}
                  </a>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Mentorship Stats */}
      <GlassCard className="p-7 md:p-8">
        <h2 className="text-lg font-bold mb-5">Mentorship Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: "Students Mentored", value: 24, icon: Users, color: "text-purple-400" },
            { label: "Sessions Completed", value: 156, icon: Video, color: "text-blue-400" },
            { label: "Hours Contributed", value: 320, icon: Clock, color: "text-emerald-400" },
            { label: "Success Stories", value: 12, icon: Star, color: "text-yellow-400" },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-xl bg-white/5 text-center">
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <p className="text-2xl font-bold mb-1"><AnimatedCounter value={stat.value} /></p>
              <p className="text-xs text-white/40 leading-relaxed">{stat.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}
