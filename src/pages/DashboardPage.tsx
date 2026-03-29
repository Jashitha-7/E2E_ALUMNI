import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout, { DashboardRole } from '../components/dashboard/DashboardLayout';

const roles: DashboardRole[] = ['admin', 'alumni', 'student'];

export default function DashboardPage() {
  const [role, setRole] = useState<DashboardRole>('admin');

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="fixed top-6 right-6 z-[200]">
        <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-2 py-2">
          {roles.map((item) => (
            <motion.button
              key={item}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRole(item)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all ${
                item === role
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {item}
            </motion.button>
          ))}
        </div>
      </div>
      <DashboardLayout role={role} />
    </div>
  );
}
