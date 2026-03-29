"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  User,
  UserCheck,
  BarChart3,
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle,
  Eye,
  MoreVertical,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  Flag,
  MessageSquare,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  UserPlus,
} from "lucide-react";

type NavItem = "analytics" | "users" | "moderation" | "profile";

const navItems = [
  { id: "analytics" as NavItem, label: "Analytics", icon: BarChart3 },
  { id: "users" as NavItem, label: "User Management", icon: Users },
  { id: "moderation" as NavItem, label: "Moderation", icon: Shield },
  { id: "profile" as NavItem, label: "Profile", icon: User },
];

export default function AdminDashboardPage() {
  const [activeNav, setActiveNav] = React.useState<NavItem>("analytics");
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const sidebarWidth = sidebarCollapsed ? 80 : 260;
  const storedUser = localStorage.getItem("adminUser") || localStorage.getItem("user") || "";
  let fullName = "Administrator";

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser) as { name?: string };
      if (parsed.name) fullName = parsed.name;
    } catch {
      // no-op
    }
  }

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "AD";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        className="fixed left-0 top-0 h-full bg-slate-900/50 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-semibold">Admin Panel</p>
              <p className="text-xs text-white/40">Control Center</p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeNav === item.id
                  ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </motion.button>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`} />
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div 
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 px-4 md:px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold truncate">{navItems.find(n => n.id === activeNav)?.label}</h1>
            <p className="text-xs md:text-sm text-white/40">Welcome back, Administrator</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                className="!pl-10 pr-4 py-2 w-48 lg:w-64 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-500/50"
              />
            </div>
            <button className="relative p-2 rounded-xl hover:bg-white/5">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 rounded-xl hover:bg-white/5 hidden md:flex">
              <Settings className="w-5 h-5 text-white/60" />
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveNav("profile")}
              className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium leading-tight">{fullName}</p>
                <p className="text-xs text-white/40 leading-tight">View Profile</p>
              </div>
            </motion.button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.hash = "#/login";
              }}
              className="p-2 rounded-xl hover:bg-white/5 text-white/60 hover:text-red-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            {activeNav === "analytics" && <AnalyticsPanel key="analytics" />}
            {activeNav === "users" && <UsersPanel key="users" />}
            {activeNav === "moderation" && <ModerationPanel key="moderation" />}
            {activeNav === "profile" && <ProfilePanel key="profile" fullName={fullName} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  const stats = [
    { label: "Total Users", value: "12,847", change: "+12.5%", up: true, icon: Users },
    { label: "Active Today", value: "2,341", change: "+8.2%", up: true, icon: Activity },
    { label: "New Signups", value: "156", change: "-3.1%", up: false, icon: UserCheck },
    { label: "Reports", value: "23", change: "+2.4%", up: true, icon: AlertTriangle },
  ];

  const recentActivity = [
    { action: "New student registered", user: "alex.chen@edu.com", time: "2 min ago", type: "signup" },
    { action: "Alumni profile updated", user: "sarah.j@company.com", time: "15 min ago", type: "update" },
    { action: "Content flagged", user: "system", time: "32 min ago", type: "flag" },
    { action: "Event created", user: "admin@alumni.com", time: "1 hour ago", type: "create" },
    { action: "Job posting approved", user: "moderator@alumni.com", time: "2 hours ago", type: "approve" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20">
                <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              </div>
              <div className={`flex items-center gap-1 text-xs md:text-sm ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" /> : <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4" />}
                {stat.change}
              </div>
            </div>
            <p className="text-xl md:text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs md:text-sm text-white/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* User Growth Chart */}
        <div className="xl:col-span-2 p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 md:mb-6">
            <div>
              <h3 className="font-semibold text-sm md:text-base">User Growth</h3>
              <p className="text-xs md:text-sm text-white/40">Monthly registration trends</p>
            </div>
            <select className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/5 border border-white/10 text-xs md:text-sm">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          {/* Placeholder Chart */}
          <div className="h-48 md:h-64 flex items-end gap-1 md:gap-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-red-500/50 to-orange-500/50 rounded-t-sm md:rounded-t-lg hover:from-red-500 hover:to-orange-500 transition-all cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* User Distribution */}
        <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h3 className="font-semibold text-sm md:text-base">User Distribution</h3>
              <p className="text-xs md:text-sm text-white/40">By role type</p>
            </div>
            <PieChart className="w-4 h-4 md:w-5 md:h-5 text-white/40" />
          </div>
          <div className="space-y-3 md:space-y-4">
            {[
              { label: "Students", value: 65, color: "from-blue-500 to-cyan-500" },
              { label: "Alumni", value: 30, color: "from-purple-500 to-pink-500" },
              { label: "Admins", value: 5, color: "from-red-500 to-orange-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5 md:mb-2">
                  <span className="text-xs md:text-sm text-white/70">{item.label}</span>
                  <span className="text-xs md:text-sm font-medium">{item.value}%</span>
                </div>
                <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h3 className="font-semibold text-sm md:text-base">Recent Activity</h3>
            <p className="text-xs md:text-sm text-white/40">Platform-wide activity log</p>
          </div>
          <button className="text-xs md:text-sm text-red-400 hover:text-red-300">View all</button>
        </div>
        <div className="space-y-2 md:space-y-4">
          {recentActivity.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-white/5 transition-all"
            >
              <div className={`p-1.5 md:p-2 rounded-lg shrink-0 ${
                item.type === "signup" ? "bg-emerald-500/20 text-emerald-400" :
                item.type === "flag" ? "bg-red-500/20 text-red-400" :
                item.type === "approve" ? "bg-blue-500/20 text-blue-400" :
                "bg-white/10 text-white/60"
              }`}>
                {item.type === "signup" ? <UserCheck className="w-3 h-3 md:w-4 md:h-4" /> :
                 item.type === "flag" ? <Flag className="w-3 h-3 md:w-4 md:h-4" /> :
                 item.type === "approve" ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> :
                 <Activity className="w-3 h-3 md:w-4 md:h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium truncate">{item.action}</p>
                <p className="text-xs text-white/40 truncate">{item.user}</p>
              </div>
              <span className="text-xs text-white/40 shrink-0">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function UsersPanel() {
  const [filter, setFilter] = React.useState("all");
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newUser, setNewUser] = React.useState({ name: "", email: "", role: "student" });
  
  const users = [
    { id: 1, name: "Alex Chen", email: "alex.chen@edu.com", role: "student", status: "active", joined: "Jan 15, 2026" },
    { id: 2, name: "Sarah Johnson", email: "sarah.j@company.com", role: "alumni", status: "active", joined: "Dec 20, 2025" },
    { id: 3, name: "Mike Wilson", email: "mike.w@edu.com", role: "student", status: "pending", joined: "Jan 28, 2026" },
    { id: 4, name: "Emily Brown", email: "emily.b@corp.com", role: "alumni", status: "active", joined: "Nov 10, 2025" },
    { id: 5, name: "James Lee", email: "james.l@edu.com", role: "student", status: "banned", joined: "Oct 5, 2025" },
    { id: 6, name: "Anna Davis", email: "anna.d@tech.com", role: "alumni", status: "invited", joined: "Jan 29, 2026" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "student", "alumni", "admin"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs">
            <Filter className="w-3 h-3" />
            Filters
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs">
            <Download className="w-3 h-3" />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>

      {/* Users List - Card Style */}
      <div className="space-y-3">
        {users.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center text-sm font-medium shrink-0">
                  {user.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === "admin" ? "bg-red-500/20 text-red-300" :
                user.role === "alumni" ? "bg-purple-500/20 text-purple-300" :
                "bg-blue-500/20 text-blue-300"
              }`}>
                {user.role}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.status === "active" ? "bg-emerald-500/20 text-emerald-300" :
                user.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                user.status === "invited" ? "bg-blue-500/20 text-blue-300" :
                "bg-red-500/20 text-red-300"
              }`}>
                {user.status}
              </span>
              <span className="text-xs text-white/40 ml-auto">Joined {user.joined}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Add New User</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-500/50 placeholder:text-white/30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-500/50 placeholder:text-white/30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer"
                  >
                    <option value="student" className="bg-slate-900">Student</option>
                    <option value="alumni" className="bg-slate-900">Alumni</option>
                    <option value="admin" className="bg-slate-900">Admin</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Here you would typically call an API to add the user
                      console.log("Adding user:", newUser);
                      alert(`User "${newUser.name}" would be added (API not connected)`);
                      setNewUser({ name: "", email: "", role: "student" });
                      setShowAddModal(false);
                    }}
                    disabled={!newUser.name || !newUser.email}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add User
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

function ProfilePanel({ fullName }: { fullName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      <div className="p-7 md:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
        <h2 className="text-2xl font-semibold">Admin Profile</h2>
        <p className="text-white/50 mt-2">Manage your account and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-7">
        <div className="lg:col-span-1 p-7 md:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl font-bold mb-5">
            {fullName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() || "")
              .join("") || "AD"}
          </div>
          <p className="text-lg font-semibold">{fullName}</p>
          <p className="text-sm text-white/40">Administrator</p>
        </div>

        <div className="lg:col-span-2 p-7 md:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-white/40 mb-2">Display Name</p>
              <p className="text-sm font-medium">{fullName}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-2">Role</p>
              <p className="text-sm font-medium">Admin</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-2">Permission Level</p>
              <p className="text-sm font-medium">Superuser</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-2">Session</p>
              <p className="text-sm font-medium">Active</p>
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-sm font-medium hover:opacity-90 transition-opacity">
            Update Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ModerationPanel() {
  const reports = [
    { id: 1, type: "spam", content: "Suspicious job posting with external links", reporter: "john.d@edu.com", status: "pending", time: "2 hours ago" },
    { id: 2, type: "harassment", content: "Inappropriate message in alumni chat", reporter: "mary.k@company.com", status: "reviewing", time: "5 hours ago" },
    { id: 3, type: "fake", content: "Potentially fake alumni profile", reporter: "system", status: "pending", time: "1 day ago" },
    { id: 4, type: "spam", content: "Mass promotional messages", reporter: "admin@alumni.com", status: "resolved", time: "2 days ago" },
  ];

  const pendingApprovals = [
    { id: 1, type: "job", title: "Senior Developer at TechCorp", submitter: "alumni@company.com", time: "30 min ago" },
    { id: 2, type: "event", title: "Career Fair 2026", submitter: "events@alumni.com", time: "2 hours ago" },
    { id: 3, type: "story", title: "My Journey to Google", submitter: "success@alumni.com", time: "4 hours ago" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Pending Reports", value: "12", icon: AlertTriangle, color: "from-yellow-500 to-orange-500" },
          { label: "In Review", value: "5", icon: Eye, color: "from-blue-500 to-cyan-500" },
          { label: "Resolved Today", value: "28", icon: CheckCircle, color: "from-emerald-500 to-green-500" },
          { label: "Banned Users", value: "3", icon: Ban, color: "from-red-500 to-pink-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shrink-0`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/50 truncate">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Reports Queue */}
        <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h3 className="font-semibold text-sm md:text-base">Reports Queue</h3>
              <p className="text-xs md:text-sm text-white/40">Content requiring review</p>
            </div>
            <button className="p-2 rounded-lg hover:bg-white/10">
              <RefreshCw className="w-4 h-4 text-white/60" />
            </button>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    report.type === "spam" ? "bg-yellow-500/20 text-yellow-300" :
                    report.type === "harassment" ? "bg-red-500/20 text-red-300" :
                    "bg-orange-500/20 text-orange-300"
                  }`}>
                    {report.type}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs ${
                    report.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                    report.status === "reviewing" ? "bg-blue-500/20 text-blue-300" :
                    "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-xs md:text-sm mb-2 line-clamp-2">{report.content}</p>
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-white/40">
                  <span className="truncate">by {report.reporter}</span>
                  <span className="shrink-0">{report.time}</span>
                </div>
                {report.status !== "resolved" && (
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 transition-colors">
                      Approve
                    </button>
                    <button className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors">
                      Remove
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h3 className="font-semibold text-sm md:text-base">Pending Approvals</h3>
              <p className="text-xs md:text-sm text-white/40">Content awaiting publication</p>
            </div>
            <span className="px-2 md:px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-medium shrink-0">
              {pendingApprovals.length} pending
            </span>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {pendingApprovals.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    item.type === "job" ? "bg-blue-500/20 text-blue-300" :
                    item.type === "event" ? "bg-purple-500/20 text-purple-300" :
                    "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {item.type === "job" ? <Briefcase className="w-4 h-4" /> :
                     item.type === "event" ? <Calendar className="w-4 h-4" /> :
                     <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs md:text-sm truncate">{item.title}</p>
                    <p className="text-xs text-white/40 truncate">{item.submitter} • {item.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 transition-colors">
                    Approve
                  </button>
                  <button className="flex-1 py-2 rounded-lg bg-white/10 text-white/60 text-xs font-medium hover:bg-white/20 transition-colors">
                    Review
                  </button>
                  <button className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors">
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
