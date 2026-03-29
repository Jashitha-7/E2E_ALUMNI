import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export default function StatCard({
  label,
  value,
  change,
  Icon,
  gradient,
}: {
  label: string;
  value: string;
  change: string;
  Icon: LucideIcon;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-2xl p-5 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/60">{label}</p>
          <h3 className="text-2xl font-semibold mt-2">{value}</h3>
        </div>
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="mt-4 text-sm text-emerald-400">{change} this week</div>
    </motion.div>
  );
}
