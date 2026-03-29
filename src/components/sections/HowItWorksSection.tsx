import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { UserPlus, Search, Handshake, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Sign up with your alumni credentials and build a comprehensive professional profile.',
    color: 'brand',
  },
  {
    number: '02',
    icon: Search,
    title: 'Discover Alumni',
    description: 'Browse the directory, filter by interests, industry, or location to find relevant connections.',
    color: 'accent',
  },
  {
    number: '03',
    icon: Handshake,
    title: 'Connect & Network',
    description: 'Send connection requests, join groups, and participate in discussions that matter to you.',
    color: 'brand',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Grow Together',
    description: 'Collaborate on opportunities, mentor others, and advance your career with alumni support.',
    color: 'accent',
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative group"
    >
      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent -translate-y-1/2 z-0" />
      )}
      
      {/* Card */}
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full"
      >
        {/* Step number */}
        <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${
          step.color === 'brand' ? 'from-brand-500 to-brand-600' : 'from-accent-500 to-accent-600'
        } flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
          {step.number}
        </div>
        
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
            step.color === 'brand' ? 'from-brand-500/20 to-brand-600/20' : 'from-accent-500/20 to-accent-600/20'
          } flex items-center justify-center mb-6 mt-4`}
        >
          <step.icon className={`w-8 h-8 ${
            step.color === 'brand' ? 'text-brand-400' : 'text-accent-400'
          }`} />
        </motion.div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
        <p className="text-white/60 leading-relaxed">{step.description}</p>
        
        {/* Hover effect */}
        <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${
          step.color === 'brand' ? 'from-brand-500/5 to-transparent' : 'from-accent-500/5 to-transparent'
        }`} />
      </motion.div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Animated background */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-brand-950/30 to-neutral-950"
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Floating elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-40 left-20 w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 backdrop-blur-sm"
      />
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-40 right-20 w-32 h-32 rounded-full bg-accent-500/10 border border-accent-500/20 backdrop-blur-sm"
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-10 sm:px-12 lg:px-16">
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-2 rounded-full bg-accent-500/10 text-accent-400 text-sm font-medium mb-6"
          >
            Simple Process
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            How It{' '}
            <span className="text-accent-300">
              Works
            </span>
          </motion.h2>
          
          <div className="flex justify-center">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/60 max-w-2xl text-center w-full"
            >
              Get started in minutes. Our streamlined process makes it easy to 
              join and benefit from the alumni network.
            </motion.p>
          </div>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(6, 182, 212, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-gradient-to-r from-accent-500 to-brand-500 rounded-2xl text-white font-semibold text-lg"
          >
            Start Your Journey Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
