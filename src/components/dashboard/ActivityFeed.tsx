import { motion } from 'framer-motion';
import { MessageCircle, Calendar, Briefcase, Users } from 'lucide-react';
import type { DashboardRole } from './DashboardLayout';

const feedData = {
  admin: [
    { icon: Users, title: '120 new members pending approval', time: '2m ago' },
    { icon: Calendar, title: 'Board meeting scheduled for next week', time: '45m ago' },
    { icon: Briefcase, title: '32 new job posts require review', time: '2h ago' },
  ],
  alumni: [
    { icon: MessageCircle, title: 'Mentor Olivia replied to your message', time: '5m ago' },
    { icon: Calendar, title: 'Tech mixer RSVP confirmed', time: '1h ago' },
    { icon: Briefcase, title: 'New opportunity: Product Lead at Nova', time: '3h ago' },
  ],
  student: [
    { icon: Users, title: '3 alumni accepted your mentorship request', time: '12m ago' },
    { icon: Briefcase, title: 'New internship: UX Designer at Helix', time: '2h ago' },
    { icon: Calendar, title: 'Workshop “Resume Polish” starts tomorrow', time: '6h ago' },
  ],
} as const;

export default function ActivityFeed({ role }: { role: DashboardRole }) {
  const items = feedData[role];

  return (
    <div className="glass rounded-3xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Activity Feed</h3>
          <p className="text-sm text-white/50">Latest updates from your network</p>
        </div>
        <button className="text-xs text-white/60 hover:text-white">View all</button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
          >
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <item.icon className="h-5 w-5 text-white/70" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/80">{item.title}</p>
              <span className="text-xs text-white/50">{item.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
