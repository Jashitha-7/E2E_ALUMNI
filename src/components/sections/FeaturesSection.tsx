import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Users, Globe, Briefcase, MessageSquare, Award, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Alumni Directory',
    description: 'Find and connect with fellow alumni across the globe. Search by graduation year, industry, or location.',
    color: 'from-brand-500 to-purple-600',
    delay: 0,
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Access a worldwide community of professionals. Expand your reach beyond geographical boundaries.',
    color: 'from-accent-500 to-cyan-600',
    delay: 0.1,
  },
  {
    icon: Briefcase,
    title: 'Job Board',
    description: 'Exclusive job opportunities posted by alumni-owned companies and partner organizations.',
    color: 'from-emerald-500 to-green-600',
    delay: 0.2,
  },
  {
    icon: MessageSquare,
    title: 'Discussion Forums',
    description: 'Engage in meaningful conversations. Share experiences, seek advice, and collaborate on projects.',
    color: 'from-orange-500 to-amber-600',
    delay: 0.3,
  },
  {
    icon: Award,
    title: 'Mentorship Program',
    description: 'Connect with experienced alumni mentors or guide the next generation of graduates.',
    color: 'from-pink-500 to-rose-600',
    delay: 0.4,
  },
  {
    icon: TrendingUp,
    title: 'Events & Reunions',
    description: 'Stay updated on alumni gatherings, webinars, workshops, and networking events.',
    color: 'from-indigo-500 to-blue-600',
    delay: 0.5,
  },
];

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-100px' });
  
  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 400, damping: 30 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ 
        duration: 0.7, 
        delay: feature.delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        perspective: '1000px',
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="group relative transform-gpu"
    >
      {/* Glow effect */}
      <motion.div 
        className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-3xl opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500`}
        style={{ transform: 'translateZ(-20px)' }}
      />
      
      {/* Depth shadow */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-black/50"
        style={{ 
          transform: 'translateZ(-30px) translateY(10px)',
          filter: 'blur(20px)',
        }}
      />
      
      {/* Card */}
      <div 
        className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden"
        style={{ transform: 'translateZ(0px)' }}
      >
        {/* Background gradient */}
        <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.color} opacity-10 blur-3xl`} />
        
        {/* Icon with 3D pop */}
        <motion.div
          whileHover={{ scale: 1.15, rotate: 5, z: 30 }}
          style={{ transform: 'translateZ(40px)' }}
          className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}
        >
          <feature.icon className="w-7 h-7 text-white" />
        </motion.div>
        
        {/* Content */}
        <h3 
          className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all"
          style={{ transform: 'translateZ(20px)' }}
        >
          {feature.title}
        </h3>
        <p 
          className="text-white/60 leading-relaxed"
          style={{ transform: 'translateZ(10px)' }}
        >
          {feature.description}
        </p>
        
        {/* Hover arrow */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          style={{ transform: 'translateZ(30px)' }}
          className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
      
      {/* Floating orbs */}
      <motion.div
        style={{ y }}
        className="absolute top-20 left-10 w-72 h-72 bg-brand-500/20 rounded-full blur-[100px]"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]) }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-[120px]"
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-10 sm:px-12 lg:px-16">
        {/* Section header */}
        <motion.div
          style={{ opacity }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-2 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-6"
          >
            Platform Features
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-10"
          >
            Everything You Need to
            <br />
            <span className="text-brand-300">
              Stay Connected
            </span>
          </motion.h2>
          
          <div className="flex justify-center">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/60 max-w-3xl text-center w-full"
            >
              Powerful tools designed to help you maintain meaningful connections 
              and advance your professional journey.
            </motion.p>
          </div>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-12">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
