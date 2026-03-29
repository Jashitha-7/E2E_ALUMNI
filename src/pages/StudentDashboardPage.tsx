"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Home,
  Calendar,
  Briefcase,
  Users,
  MessageCircle,
  User,
  Bell,
  Search,
  Settings,
  ChevronRight,
  ChevronLeft,
  MapPin,
  GraduationCap,
  Heart,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Zap,
  Target,
  CheckCircle,
  Upload,
  Edit3,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  Camera,
  Plus,
  X,
  Check,
  LogOut,
} from "lucide-react";
import AIChatbot from "../components/chatbot/AIChatbot";
import RealtimeChatPanel from "../components/chatbot/RealtimeChatPanel";
import { getApiBase } from "../lib/apiBase";

// ============================================
// TYPES
// ============================================
type NavItem = "overview" | "events" | "jobs" | "alumni" | "chat" | "profile";

// ============================================
// 3D TILT CARD COMPONENT
// ============================================
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
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
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

// ============================================
// ANIMATED COUNTER
// ============================================
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = (duration * 1000) / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}

// ============================================
// GLASSMORPHISM CARD
// ============================================
function GlassCard({ 
  children, 
  className = "", 
  hover = true,
  gradient = "from-white/10 to-white/5"
}: { 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
  gradient?: string;
}) {
  // Check if flex is needed based on className
  const needsFlex = className.includes("flex");
  const cleanClassName = className.replace(/\bflex\b/, "").trim();
  
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${gradient}
        backdrop-blur-xl border border-white/10
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        ${cleanClassName}
      `}
    >
      {/* Shine effect - pointer-events-none to not block clicks */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />
      <div className={`relative z-10 h-full ${needsFlex ? "flex" : ""}`}>{children}</div>
    </motion.div>
  );
}

// ============================================
// NAVIGATION ITEMS
// ============================================
const navItems = [
  { id: "overview" as NavItem, label: "Overview", icon: Home },
  { id: "events" as NavItem, label: "Events", icon: Calendar },
  { id: "jobs" as NavItem, label: "Jobs", icon: Briefcase },
  { id: "alumni" as NavItem, label: "Alumni", icon: Users },
  { id: "chat" as NavItem, label: "Chat", icon: MessageCircle, badge: 3 },
  { id: "profile" as NavItem, label: "Profile", icon: User },
];

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function StudentDashboardPage() {
  const [activeNav, setActiveNav] = useState<NavItem>("overview");
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications] = useState(5);
  const [studentProfile, setStudentProfile] = useState<{
    name: string;
    department?: string;
    graduationYear?: number;
  } | null>(null);

  const metaEnv = (import.meta as { env?: { VITE_API_URL?: string } }).env;
  const apiBase = metaEnv?.VITE_API_URL ?? "/api/v1";

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      const accessToken = localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await fetch(`${apiBase}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) return;
        const data = await response.json();

        if (!mounted) return;
        setStudentProfile({
          name: data?.name || "Student",
          department: data?.department,
          graduationYear: data?.graduationYear,
        });
      } catch {
        // keep default UI values when profile fetch fails
      }
    };

    void fetchProfile();

    return () => {
      mounted = false;
    };
  }, [apiBase]);

  const sidebarWidth = sidebarCollapsed ? 80 : 280;
  const fullName = studentProfile?.name || "Student";
  const firstName = fullName.split(" ")[0] || "Student";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ST";
  const academicLine = [
    studentProfile?.department,
    studentProfile?.graduationYear ? `Batch ${studentProfile.graduationYear}` : undefined,
  ]
    .filter(Boolean)
    .join(" - ") || "Student";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full bg-slate-900/50 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25"
          >
            <GraduationCap className="w-6 h-6 text-white" />
          </motion.div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="font-bold text-lg">AlumniHub</p>
                <p className="text-xs text-white/40">Student Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                activeNav === item.id
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white shadow-lg shadow-blue-500/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {activeNav === item.id && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"
                />
              )}
              <item.icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && !sidebarCollapsed && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                >
                  {item.badge}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/5">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{fullName}</p>
                <p className="text-xs text-white/40 truncate">{academicLine}</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-white/5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.hash = "#/login";
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-all mb-2"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="min-h-screen"
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 px-6 py-4 bg-slate-950/50 backdrop-blur-2xl border-b border-white/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search events, jobs, alumni..."
                  className="w-full !pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
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
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.button>

              {/* Settings */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </motion.button>

              {/* Profile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveNav("profile")}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm font-bold">
                  {initials}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{fullName}</p>
                  <p className="text-xs text-white/40">View Profile</p>
                </div>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeNav === "overview" && <OverviewPanel key="overview" studentFirstName={firstName} />}
            {activeNav === "events" && <EventsPanel key="events" />}
            {activeNav === "jobs" && <JobsPanel key="jobs" />}
            {activeNav === "alumni" && (
              <AlumniPanel
                key="alumni"
                onOpenChat={(chatId) => {
                  setPendingChatId(chatId);
                  setActiveNav("chat");
                }}
              />
            )}
            {activeNav === "chat" && <ChatPanel key="chat" initialChatId={pendingChatId} />}
            {activeNav === "profile" && <ProfilePanel key="profile" />}
          </AnimatePresence>
        </div>
      </motion.main>

      {/* AI Chatbot - Floating Widget */}
      <AIChatbot 
        studentName={firstName}
        onNavigate={(path) => {
          // Navigate to the appropriate section
          if (path === "events") setActiveNav("events");
          else if (path === "jobs") setActiveNav("jobs");
          else if (path === "alumni") setActiveNav("alumni");
          else if (path === "profile") setActiveNav("profile");
        }}
      />
    </div>
  );
}

// ============================================
// OVERVIEW PANEL
// ============================================
function OverviewPanel({ studentFirstName }: { studentFirstName: string }) {
  const stats = [
    { label: "Upcoming Events", value: 8, icon: Calendar, color: "from-blue-500 to-cyan-400", change: "+12%", up: true },
    { label: "Job Opportunities", value: 24, icon: Briefcase, color: "from-purple-500 to-pink-400", change: "+8%", up: true },
    { label: "Alumni Connected", value: 156, icon: Users, color: "from-emerald-500 to-teal-400", change: "+23%", up: true },
    { label: "New Messages", value: 12, icon: MessageCircle, color: "from-orange-500 to-amber-400", change: "+5%", up: true },
  ];

  const activities = [
    { type: "event", title: "Tech Career Fair 2026", time: "2 hours ago", icon: Calendar, color: "bg-blue-500/20 text-blue-400" },
    { type: "job", title: "Applied to Google SWE Intern", time: "5 hours ago", icon: Briefcase, color: "bg-purple-500/20 text-purple-400" },
    { type: "connection", title: "Connected with Sarah (Google)", time: "1 day ago", icon: Users, color: "bg-emerald-500/20 text-emerald-400" },
    { type: "message", title: "New message from mentor", time: "2 days ago", icon: MessageCircle, color: "bg-orange-500/20 text-orange-400" },
  ];

  const upcomingEvents = [
    { title: "AI Workshop", date: "Feb 5", time: "2:00 PM", attendees: 45 },
    { title: "Resume Review", date: "Feb 8", time: "10:00 AM", attendees: 23 },
    { title: "Mock Interviews", date: "Feb 12", time: "3:00 PM", attendees: 18 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-purple-600/20 border border-white/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-2"
          >
            Welcome back, {studentFirstName}! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg"
          >
            You have <span className="text-cyan-400 font-semibold">3 new opportunities</span> waiting for you
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Explore Jobs
            </button>
            <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-medium transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              View Events
            </button>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <TiltCard key={stat.label}>
            <GlassCard className="p-6" hover={false}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </motion.div>
            </GlassCard>
          </TiltCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className={`p-3 rounded-xl ${activity.color}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate group-hover:text-blue-400 transition-colors">{activity.title}</p>
                  <p className="text-sm text-white/40">{activity.time}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Upcoming Events */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Upcoming</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">See All</button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate group-hover:text-blue-400 transition-colors">{event.title}</p>
                    <p className="text-sm text-white/40">{event.date} at {event.time}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-white/40">
                      <Users className="w-3 h-3" />
                      {event.attendees} attending
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Find Mentor", icon: Target, color: "from-purple-500 to-pink-400" },
          { label: "Apply to Jobs", icon: Briefcase, color: "from-blue-500 to-cyan-400" },
          { label: "Join Event", icon: Calendar, color: "from-emerald-500 to-teal-400" },
          { label: "Update Resume", icon: Upload, color: "from-orange-500 to-amber-400" },
        ].map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg hover:shadow-xl transition-shadow`}
          >
            <action.icon className="w-8 h-8 mb-3" />
            <p className="font-semibold">{action.label}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// EVENTS PANEL
// ============================================
function EventsPanel() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([1, 3]);

  const categories = ["all", "workshops", "career", "networking", "webinars"];

  const events = [
    { id: 1, title: "AI/ML Workshop", category: "workshops", date: "Feb 5, 2026", time: "2:00 PM", location: "Tech Hall A", attendees: 45, image: "🤖", description: "Learn the fundamentals of AI and Machine Learning with hands-on projects." },
    { id: 2, title: "Tech Career Fair 2026", category: "career", date: "Feb 10, 2026", time: "10:00 AM", location: "Main Auditorium", attendees: 200, image: "💼", description: "Meet top recruiters from leading tech companies." },
    { id: 3, title: "Alumni Networking Night", category: "networking", date: "Feb 15, 2026", time: "6:00 PM", location: "Grand Hall", attendees: 80, image: "🤝", description: "Connect with successful alumni from various industries." },
    { id: 4, title: "Resume Building Webinar", category: "webinars", date: "Feb 18, 2026", time: "3:00 PM", location: "Online", attendees: 120, image: "📝", description: "Expert tips on crafting a standout resume." },
    { id: 5, title: "Mock Interview Sessions", category: "career", date: "Feb 22, 2026", time: "11:00 AM", location: "Career Center", attendees: 30, image: "🎯", description: "Practice interviews with industry professionals." },
    { id: 6, title: "Startup Showcase", category: "networking", date: "Feb 28, 2026", time: "4:00 PM", location: "Innovation Hub", attendees: 60, image: "🚀", description: "See what alumni startups are building." },
  ];

  const filteredEvents = selectedCategory === "all" 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  const toggleRegistration = (eventId: number) => {
    setRegisteredEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-white/60">Discover and register for upcoming events</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search events..."
              className="!pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 w-48"
            />
          </div>
          <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event, index) => {
          const isRegistered = registeredEvents.includes(event.id);
          return (
            <TiltCard key={event.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <GlassCard className="p-6 h-full flex flex-col" hover={false}>
                  {/* Event Image/Emoji */}
                  <div className="text-5xl mb-4">{event.image}</div>
                  
                  {/* Category Badge */}
                  <span className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 mb-3">
                    {event.category}
                  </span>
                  
                  {/* Title & Description */}
                  <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                  <p className="text-sm text-white/60 mb-4 flex-1">{event.description}</p>
                  
                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Users className="w-4 h-4 text-blue-400" />
                      {event.attendees} attending
                    </div>
                  </div>
                  
                  {/* Register Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleRegistration(event.id)}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      isRegistered
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                    }`}
                  >
                    {isRegistered ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Registered
                      </span>
                    ) : (
                      "Register Now"
                    )}
                  </motion.button>
                </GlassCard>
              </motion.div>
            </TiltCard>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================
// JOBS PANEL
// ============================================
function JobsPanel() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [savedJobs, setSavedJobs] = useState<number[]>([2]);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([1]);

  const filters = ["all", "internship", "full-time", "remote", "on-site"];

  const jobs = [
    { id: 1, title: "Software Engineer Intern", company: "Google", location: "Mountain View, CA", type: "internship", salary: "$8,000/mo", logo: "🔵", skills: ["Python", "TensorFlow", "ML"], posted: "2 days ago" },
    { id: 2, title: "Frontend Developer", company: "Meta", location: "Remote", type: "remote", salary: "$120K - $180K", logo: "🟦", skills: ["React", "TypeScript", "CSS"], posted: "1 week ago" },
    { id: 3, title: "Data Scientist", company: "Amazon", location: "Seattle, WA", type: "full-time", salary: "$150K - $200K", logo: "🟠", skills: ["Python", "SQL", "AWS"], posted: "3 days ago" },
    { id: 4, title: "Product Manager Intern", company: "Microsoft", location: "Redmond, WA", type: "internship", salary: "$9,000/mo", logo: "🟩", skills: ["Agile", "Analytics", "Leadership"], posted: "5 days ago" },
    { id: 5, title: "Backend Engineer", company: "Netflix", location: "Los Gatos, CA", type: "on-site", salary: "$180K - $250K", logo: "🔴", skills: ["Java", "Microservices", "AWS"], posted: "1 day ago" },
    { id: 6, title: "UX Designer", company: "Apple", location: "Cupertino, CA", type: "full-time", salary: "$140K - $190K", logo: "⚪", skills: ["Figma", "Prototyping", "User Research"], posted: "4 days ago" },
  ];

  const filteredJobs = selectedFilter === "all"
    ? jobs
    : jobs.filter(j => j.type === selectedFilter);

  const toggleSaved = (jobId: number) => {
    setSavedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const applyToJob = (jobId: number) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs(prev => [...prev, jobId]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Job Opportunities</h1>
          <p className="text-white/60">Find your dream job from top companies</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="!pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 w-48"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <p className="text-2xl font-bold text-blue-400">{jobs.length}</p>
          <p className="text-sm text-white/60">Total Jobs</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-2xl font-bold text-emerald-400">{appliedJobs.length}</p>
          <p className="text-sm text-white/60">Applied</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-2xl font-bold text-purple-400">{savedJobs.length}</p>
          <p className="text-sm text-white/60">Saved</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-2xl font-bold text-orange-400">3</p>
          <p className="text-sm text-white/60">Interviews</p>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <motion.button
            key={filter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedFilter === filter
                ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1).replace("-", " ")}
          </motion.button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job, index) => {
          const isSaved = savedJobs.includes(job.id);
          const isApplied = appliedJobs.includes(job.id);
          
          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Company Logo */}
                  <div className="text-4xl">{job.logo}</div>
                  
                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold mb-1">{job.title}</h3>
                        <p className="text-white/60">{job.company}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSaved(job.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isSaved ? "text-pink-400" : "text-white/40 hover:text-white"
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                      </motion.button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="flex items-center gap-1 text-sm text-white/60">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-white/60">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </span>
                      <span className="text-sm font-medium text-emerald-400">{job.salary}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-white/40">{job.posted}</span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => applyToJob(job.id)}
                      disabled={isApplied}
                      className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                        isApplied
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:opacity-90"
                      }`}
                    >
                      {isApplied ? "Applied" : "Apply Now"}
                    </motion.button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================
// ALUMNI PANEL
// ============================================
function AlumniPanel({ onOpenChat }: { onOpenChat: (chatId: string) => void }) {
  type AlumniDirectoryMember = {
    id: string;
    name: string;
    batch: string;
    company: string;
    role: string;
    location: string;
    avatar: string;
    skills: string[];
    isMentor: boolean;
    email: string;
    bio: string;
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniDirectoryMember | null>(null);
  const [alumni, setAlumni] = useState<AlumniDirectoryMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);

  const batches = ["all", "2020", "2021", "2022", "2023", "2024", "2025"];

  const metaEnv = (import.meta as { env?: { VITE_API_URL?: string } }).env;
  const apiBase = metaEnv?.VITE_API_URL ?? "/api/v1";

  const getStoredAccessToken = () =>
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";

  React.useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      setLoadError("Please login again to view the alumni directory.");
      setAlumni([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const params = new URLSearchParams({
          search: searchQuery,
          year: selectedBatch,
          limit: "100",
        });

        const response = await fetch(`${apiBase}/users/alumni?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const raw = await response.text();
        const payload = raw ? JSON.parse(raw) : null;

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load alumni directory");
        }

        const list = (payload?.data?.alumni || []).map((item: {
          _id: string;
          name?: string;
          email?: string;
          department?: string;
          graduationYear?: number;
          bio?: string;
        }) => {
          const initials = (item.name || "A")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part: string) => part[0]?.toUpperCase() || "")
            .join("");

          return {
            id: item._id,
            name: item.name || "Alumni",
            email: item.email || "",
            batch: item.graduationYear ? String(item.graduationYear) : "N/A",
            company: "Alumni Network",
            role: item.department || "Alumni",
            location: "",
            avatar: initials || "AL",
            skills: item.department ? [item.department] : [],
            isMentor: true,
            bio: item.bio || "",
          } as AlumniDirectoryMember;
        });

        setAlumni(list);
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") return;
        setLoadError(error instanceof Error ? error.message : "Failed to load alumni directory");
        setAlumni([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [apiBase, searchQuery, selectedBatch]);

  const filteredAlumni = alumni.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = selectedBatch === "all" || a.batch === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  const requestMentorship = (alumniMember: AlumniDirectoryMember) => {
    setSelectedAlumni(alumniMember);
    setShowMentorModal(true);
  };

  const startDirectChat = async (alumniMember: AlumniDirectoryMember) => {
    const token = getStoredAccessToken();
    if (!token) {
      setLoadError("Please login again to start chatting.");
      return;
    }

    try {
      setChatLoadingId(alumniMember.id);
      setLoadError(null);

      const response = await fetch(`${apiBase}/chats/direct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId: alumniMember.id }),
      });

      const raw = await response.text();
      const payload = raw ? JSON.parse(raw) : null;

      if (!response.ok || !payload?.data?._id) {
        throw new Error(payload?.message || "Unable to start chat");
      }

      onOpenChat(payload.data._id);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to start chat");
    } finally {
      setChatLoadingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Alumni Directory</h1>
          <p className="text-white/60">Connect with alumni and find mentors</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full !pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {batches.map((batch) => (
            <motion.button
              key={batch}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBatch(batch)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedBatch === batch
                  ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {batch === "all" ? "All Batches" : `Batch ${batch}`}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatLoadingId && !isLoading && (
          <div className="col-span-full text-center text-cyan-300 py-2">Opening chat...</div>
        )}
        {isLoading && (
          <div className="col-span-full text-center text-white/60 py-10">Loading alumni directory...</div>
        )}
        {loadError && !isLoading && (
          <div className="col-span-full text-center text-rose-300 py-10">{loadError}</div>
        )}
        {!isLoading && !loadError && filteredAlumni.length === 0 && (
          <div className="col-span-full text-center text-white/50 py-10">No alumni found for your search.</div>
        )}
        {filteredAlumni.map((member, index) => (
          <div key={member.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{member.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate">{member.name}</h3>
                      {member.isMentor && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400">
                          Mentor
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60">{member.role}</p>
                    <p className="text-sm text-blue-400">{member.company}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <MapPin className="w-4 h-4" />
                    {member.location || "Not specified"}
                  </div>
                  <span className="text-xs text-white/40">Batch {member.batch}</span>
                </div>

                <div className="mt-4 flex gap-2 relative z-30">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startDirectChat(member)}
                    disabled={chatLoadingId === member.id}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {chatLoadingId === member.id ? "Opening..." : "Message"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => requestMentorship(member)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    Mentor
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Mentorship Request Modal */}
      <AnimatePresence>
        {showMentorModal && selectedAlumni && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMentorModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Request Mentorship</h3>
                <button
                  onClick={() => setShowMentorModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-white/5">
                <div className="text-4xl">{selectedAlumni.avatar}</div>
                <div>
                  <p className="font-bold">{selectedAlumni.name}</p>
                  <p className="text-sm text-white/60">{selectedAlumni.role} at {selectedAlumni.company}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">What do you want to learn?</label>
                  <textarea
                    placeholder="I'm interested in learning about..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/30 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Your goals</label>
                  <input
                    type="text"
                    placeholder="e.g., Land an internship at a FAANG company"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/30"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowMentorModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert(`Mentorship request sent to ${selectedAlumni.name}!`);
                      setShowMentorModal(false);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Send Request
                  </button>
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
function ChatPanel({ initialChatId }: { initialChatId?: string | null }) {
  return <RealtimeChatPanel initialChatId={initialChatId ?? undefined} />;
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
    name: "John Student",
    email: "john.student@university.edu",
    phone: "+1 (555) 123-4567",
    batch: "2026",
    major: "Computer Science",
    bio: "Passionate about building innovative solutions with AI and web technologies. Currently seeking internship opportunities in software engineering.",
    skills: ["React", "TypeScript", "Python", "Machine Learning", "Node.js", "AWS"],
    linkedin: "linkedin.com/in/johnstudent",
    github: "github.com/johnstudent",
    portfolio: "johnstudent.dev",
  });

  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const accessToken = localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await fetch(`${apiBase}/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const payload = data?.data ?? data;
        if (!mounted || !payload) return;

        setProfile((prev) => ({
          ...prev,
          name: payload.name || prev.name,
          email: payload.email || prev.email,
          phone: payload.phone || prev.phone,
          batch: payload.graduationYear ? String(payload.graduationYear) : prev.batch,
          major: payload.department || prev.major,
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

      const response = await fetch(`${apiBase}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          graduationYear: Number(profile.batch) || undefined,
          department: profile.major,
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
          batch: updated.graduationYear ? String(updated.graduationYear) : prev.batch,
          major: updated.department || prev.major,
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
      {/* Profile Header */}
      <GlassCard className="p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-5xl font-bold shadow-lg shadow-blue-500/25">
              JS
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-2 right-2 p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400">
                Student
              </span>
            </div>
            <p className="text-white/60">{profile.major} • Batch {profile.batch}</p>
            <p className="text-white/60 text-sm">{profile.email}</p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Edit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              void handleEditToggle();
            }}
            disabled={isSaving}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              isEditing
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
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
      </GlassCard>

      {/* Bio Section */}
      <GlassCard className="p-7 md:p-8">
        <h2 className="text-lg font-bold mb-5">About Me</h2>
        {isEditing ? (
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 resize-none"
          />
        ) : (
          <p className="text-white/80 leading-relaxed">{profile.bio}</p>
        )}
      </GlassCard>

      {/* Skills Section */}
      <GlassCard className="p-7 md:p-8">
        <h2 className="text-lg font-bold mb-5">Skills</h2>
        <div className="flex flex-wrap gap-3 mb-5">
          {profile.skills.map((skill) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center gap-2"
            >
              {skill}
              {isEditing && (
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-white/40 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.span>
          ))}
        </div>
        {isEditing && (
          <div className="flex gap-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addSkill}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 font-medium"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </GlassCard>

      {/* Contact & Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <GlassCard className="p-7 md:p-8">
          <h2 className="text-lg font-bold mb-5">Contact Information</h2>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm text-white/60 mb-2">Email</label>
              <div className="flex items-center gap-2 text-white/80">
                <Mail className="w-4 h-4 text-blue-400" />
                {profile.email}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-white/60 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                />
              ) : (
                <div className="flex items-center gap-2 text-white/80">
                  <Phone className="w-4 h-4 text-blue-400" />
                  {profile.phone}
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-7 md:p-8">
          <h2 className="text-lg font-bold mb-5">Social Links</h2>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm text-white/60 mb-2">LinkedIn</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                />
              ) : (
                <div className="flex items-center gap-2 text-white/80">
                  <Linkedin className="w-4 h-4 text-blue-400" />
                  {profile.linkedin}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-white/60 mb-2">GitHub</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.github}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                />
              ) : (
                <div className="flex items-center gap-2 text-white/80">
                  <Github className="w-4 h-4 text-blue-400" />
                  {profile.github}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Resume Section */}
      <GlassCard className="p-7 md:p-8">
        <h2 className="text-lg font-bold mb-5">Resume</h2>
        <div className="border-2 border-dashed border-white/10 rounded-xl p-10 md:p-12 text-center">
          <Upload className="w-12 h-12 mx-auto mb-5 text-white/40" />
          <p className="text-white/60 mb-3">Drag and drop your resume here</p>
          <p className="text-white/40 text-sm mb-5">or</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 font-medium"
          >
            Browse Files
          </motion.button>
          <p className="text-white/40 text-xs mt-5">PDF, DOC, DOCX up to 5MB</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
