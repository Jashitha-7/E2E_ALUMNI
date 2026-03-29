import { motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';
import type { DashboardRole } from './DashboardLayout';

const roleMeta = {
  admin: { label: 'Administrator', gradient: 'from-brand-500 to-accent-500' },
  alumni: { label: 'Alumni Member', gradient: 'from-accent-500 to-brand-500' },
  student: { label: 'Student', gradient: 'from-brand-500 to-purple-500' },
} as const;

export default function Topbar({ role }: { role: DashboardRole }) {
  const meta = roleMeta[role];

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div>
        <div className="text-sm text-white/50">Welcome back</div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Sofia Alvarez</h2>
          <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${meta.gradient} text-white/90`}>
            {meta.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
          <Search className="h-4 w-4 text-white/60" />
          <input
            placeholder="Search alumni, events..."
            className="bg-transparent text-sm text-white/80 placeholder:text-white/40 focus:outline-none"
          />
        </div>
        <button className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white">
          <Bell className="h-5 w-5" />
        </button>
        <motion.div
          whileHover={{ rotateY: 12 }}
          className="h-11 w-11 rounded-full border border-white/20 bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-semibold shadow-lg"
          style={{ transformStyle: 'preserve-3d' }}
        >
          SA
        </motion.div>
      </div>
    </div>
  );
}
