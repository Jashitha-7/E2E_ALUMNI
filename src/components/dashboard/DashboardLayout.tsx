import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import { Briefcase, GraduationCap, Shield, Users, Rocket, Calendar } from 'lucide-react';

export type DashboardRole = 'admin' | 'alumni' | 'student';

const roleConfig = {
  admin: {
    title: 'Admin Dashboard',
    subtitle: 'Manage the alumni ecosystem with full control.',
    accent: 'from-brand-500 to-accent-500',
    stats: [
      { label: 'Active Members', value: '42,689', icon: Users, change: '+12.4%' },
      { label: 'Events Scheduled', value: '214', icon: Calendar, change: '+8.1%' },
      { label: 'Job Posts', value: '1,248', icon: Briefcase, change: '+5.3%' },
      { label: 'Engagement Rate', value: '78.2%', icon: Rocket, change: '+2.9%' },
    ],
    actions: ['Approve New Members', 'Create Global Event', 'Publish Announcement', 'Review Reports'],
  },
  alumni: {
    title: 'Alumni Dashboard',
    subtitle: 'Grow your network and discover new opportunities.',
    accent: 'from-accent-500 to-brand-500',
    stats: [
      { label: 'Connections', value: '1,248', icon: Users, change: '+6.8%' },
      { label: 'Mentorship Hours', value: '64', icon: Shield, change: '+14.2%' },
      { label: 'Open Roles', value: '312', icon: Briefcase, change: '+3.4%' },
      { label: 'Events Attended', value: '18', icon: Calendar, change: '+1.2%' },
    ],
    actions: ['Message Mentors', 'Share Job Opening', 'RSVP to Event', 'Update Profile'],
  },
  student: {
    title: 'Student Dashboard',
    subtitle: 'Start building meaningful alumni connections today.',
    accent: 'from-brand-500 to-purple-500',
    stats: [
      { label: 'Mentors Matched', value: '6', icon: GraduationCap, change: '+2.0%' },
      { label: 'Applications Sent', value: '24', icon: Briefcase, change: '+9.1%' },
      { label: 'Workshops Joined', value: '12', icon: Calendar, change: '+3.7%' },
      { label: 'Community Points', value: '980', icon: Rocket, change: '+11.8%' },
    ],
    actions: ['Request Mentorship', 'Join Study Group', 'Apply to Internship', 'Book Career Session'],
  },
} as const;

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function DashboardLayout({ role }: { role: DashboardRole }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const config = roleConfig[role];

  const cards = useMemo(
    () =>
      config.stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          Icon={stat.icon}
          gradient={config.accent}
        />
      )),
    [config]
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex">
        <Sidebar
          role={role}
          collapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <div className="flex-1 min-w-0">
          <Topbar role={role} />
          <AnimatePresence mode="wait">
            <motion.main
              key={role}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="px-6 pb-12"
            >
              <header className="pt-10 pb-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                  <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${config.accent}`} />
                  <span className="text-sm text-white/70">Role-based workspace</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold">{config.title}</h1>
                <p className="text-white/60 mt-2 max-w-2xl">{config.subtitle}</p>
              </header>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards}
              </section>

              <section className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <ActivityFeed role={role} />
                <QuickActions role={role} actions={config.actions} accent={config.accent} />
              </section>
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
