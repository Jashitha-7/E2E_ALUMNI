import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { FloatingElement } from '../ui/Motion3D';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    graduation: 'Class of 2018',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    content: 'The Alumni Association Platform helped me land my dream job at Google. Through the mentorship program, I connected with a senior engineer who guided me through the entire interview process.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Founder & CEO, TechStart',
    graduation: 'Class of 2015',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: 'I found my co-founder and first three investors through this platform. The alumni network is incredibly supportive of entrepreneurship. This community changed my life.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Thompson',
    role: 'Marketing Director at Meta',
    graduation: 'Class of 2016',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    content: 'Being part of this network has opened doors I never knew existed. The events and webinars are top-notch, and I\'ve made lifelong friends and professional connections.',
    rating: 5,
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Investment Banker at Goldman Sachs',
    graduation: 'Class of 2017',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    content: 'The job board feature is incredible. I\'ve referred three alumni to positions at my firm, and two of them are now my colleagues. The platform makes networking effortless.',
    rating: 5,
  },
];

function TestimonialCard({ testimonial, isActive }: { testimonial: typeof testimonials[0]; isActive: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 });
  
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
      initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
      animate={{ 
        opacity: isActive ? 1 : 0.5, 
        scale: isActive ? 1 : 0.85,
        rotateY: 0
      }}
      exit={{ opacity: 0, scale: 0.9, rotateY: 20 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        perspective: '1200px',
        rotateX: isActive ? rotateX : 0,
        rotateY: isActive ? rotateY : 0,
        transformStyle: 'preserve-3d'
      }}
      className={`relative ${isActive ? 'z-10' : 'z-0'} transform-gpu`}
    >
      {/* Depth shadow */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-brand-500/20"
        style={{ 
          transform: 'translateZ(-40px) translateY(15px)',
          filter: 'blur(30px)',
        }}
      />
      
      {/* Glass card */}
      <div 
        className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 overflow-hidden"
        style={{ transform: 'translateZ(0px)' }}
      >
        {/* Background gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-500/10 via-transparent to-accent-500/10 opacity-50" />
        
        {/* Quote icon with depth */}
        <div 
          className="absolute top-6 right-6 opacity-20"
          style={{ transform: 'translateZ(20px)' }}
        >
          <Quote className="w-16 h-16 text-brand-400" />
        </div>
        
        {/* Stars */}
        <div className="flex gap-1 mb-6" style={{ transform: 'translateZ(30px)' }}>
          {[...Array(testimonial.rating)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
            >
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </motion.div>
          ))}
        </div>
        
        {/* Content */}
        <p 
          className="relative text-lg md:text-xl text-white/80 leading-relaxed mb-8 italic"
          style={{ transform: 'translateZ(15px)' }}
        >
          "{testimonial.content}"
        </p>
        
        {/* Author with depth */}
        <div className="flex items-center gap-4" style={{ transform: 'translateZ(25px)' }}>
          <motion.img
            whileHover={{ scale: 1.1, rotateZ: 5 }}
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-brand-400/50 shadow-lg shadow-brand-500/20"
          />
          <div>
            <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
            <p className="text-sm text-white/60">{testimonial.role}</p>
            <p className="text-xs text-brand-400">{testimonial.graduation}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
      
      {/* Decorative elements with floating animation */}
      <FloatingElement duration={10} distance={40} delay={0}>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[150px]"
        />
      </FloatingElement>
      <FloatingElement duration={12} distance={30} delay={2}>
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/20 rounded-full blur-[120px]"
        />
      </FloatingElement>
      
      {/* Additional floating orbs */}
      <FloatingElement duration={8} distance={25} rotation={5}>
        <div className="absolute top-20 right-20 w-32 h-32 bg-brand-400/10 rounded-full blur-[60px]" />
      </FloatingElement>
      <FloatingElement duration={9} distance={20} delay={1}>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-accent-400/10 rounded-full blur-[80px]" />
      </FloatingElement>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-2 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-6"
          >
            Success Stories
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            What Alumni{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
              Say About Us
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto"
          >
            Hear from our community members who have transformed their careers 
            through meaningful connections.
          </motion.p>
        </div>

        {/* Testimonial carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <TestimonialCard 
              key={testimonials[activeIndex].id}
              testimonial={testimonials[activeIndex]} 
              isActive={true}
            />
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? 'bg-gradient-to-r from-brand-400 to-accent-400 w-8' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
