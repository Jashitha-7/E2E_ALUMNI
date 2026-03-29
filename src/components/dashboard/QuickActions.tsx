import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { DashboardRole } from './DashboardLayout';

export default function QuickActions({
  role,
  actions,
  accent,
}: {
  role: DashboardRole;
  actions: readonly string[];
  accent: string;
}) {
  return (
    <div className="glass rounded-3xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center`}>
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <p className="text-sm text-white/50">Curated for your {role} role</p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <motion.button
            key={action}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ x: 6 }}
            className="w-full flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/80 hover:text-white"
          >
            <span>{action}</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
