import { motion } from 'framer-motion';
import {
  Home,
  Users,
  Calendar,
  Briefcase,
  MessageCircle,
  Settings,
  ChevronLeft,
  Shield,
  GraduationCap,
} from 'lucide-react';
import type { DashboardRole } from './DashboardLayout';

const navItems = {
  admin: [
    { label: 'Overview', icon: Home },
    { label: 'Members', icon: Users },
    { label: 'Events', icon: Calendar },
    { label: 'Jobs', icon: Briefcase },
    { label: 'Messages', icon: MessageCircle },
    { label: 'Settings', icon: Settings },
  ],
  alumni: [
    { label: 'Home', icon: Home },
    { label: 'Network', icon: Users },
    { label: 'Mentorship', icon: Shield },
    { label: 'Events', icon: Calendar },
    { label: 'Opportunities', icon: Briefcase },
    { label: 'Messages', icon: MessageCircle },
  ],
  student: [
    { label: 'Home', icon: Home },
    { label: 'Mentors', icon: GraduationCap },
    { label: 'Events', icon: Calendar },
    { label: 'Jobs', icon: Briefcase },
    { label: 'Community', icon: Users },
    { label: 'Messages', icon: MessageCircle },
  ],
} as const;

export default function Sidebar({
  role,
  collapsed,
  onToggle,
}: {
  role: DashboardRole;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const items = navItems[role];

  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen border-r border-white/10 bg-white/5 backdrop-blur-xl relative"
    >
      <div className="flex items-center justify-between px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          {!collapsed && <span className="text-lg font-semibold">Alumni</span>}
        </div>
        <button
          onClick={onToggle}
          className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </button>
      </div>

      <nav className="px-4 space-y-2">
        {items.map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ x: 6 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span>{item.label}</span>}
          </motion.button>
        ))}
      </nav>
    </motion.aside>
  );
}
