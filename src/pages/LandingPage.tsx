import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from '../components/sections/Navbar';
import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import { Linkedin, Github, Instagram, Mail } from 'lucide-react';
import { FloatingElement, ScrollReveal } from '../components/ui/Motion3D';

function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col items-center">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500 origin-left z-[100]"
        style={{ scaleX }}
      />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main content */}
      <main>
        {/* Hero Section */}
        <section id="hero">
          <HeroSection />
        </section>
        
        {/* Features Section */}
        <section id="features">
          <FeaturesSection />
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works">
          <HowItWorksSection />
        </section>
        
        {/* CTA Section before Footer */}
        <CTASection />
      </main>
      
      {/* Contact */}
      <section id="contact">
        <ContactSection />
      </section>
    </div>
  );
}

// Final CTA Section
function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-brand-950/50 to-black" />
      
      {/* Animated background orbs with floating effect */}
      <FloatingElement duration={12} distance={50}>
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/30 rounded-full blur-[150px]"
        />
      </FloatingElement>
      
      {/* Additional floating orbs */}
      <FloatingElement duration={8} distance={30} delay={1}>
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent-500/20 rounded-full blur-[100px]" />
      </FloatingElement>
      <FloatingElement duration={10} distance={40} delay={2}>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-400/15 rounded-full blur-[120px]" />
      </FloatingElement>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
      </div>
    </section>
  );
}

export default LandingPage;

function ContactSection() {
  return (
    <section className="relative py-20 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
      <div className="relative z-10 max-w-5xl mx-auto px-10 sm:px-12 lg:px-16 text-center">
        <ScrollReveal direction="up" duration={0.7} className="w-full text-center flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Contact
          </h2>
          <p className="text-white/60 max-w-2xl text-center">
            Reach out and stay connected with the alumni community.
          </p>
        </ScrollReveal>

        <div className="mt-10 flex items-center justify-center gap-6">
          <a
            href="mailto:contact@alumni.com"
            aria-label="Email"
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Mail className="w-6 h-6" />
          </a>
          <a
            href="#"
            aria-label="LinkedIn"
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Linkedin className="w-6 h-6" />
          </a>
          <a
            href="#"
            aria-label="GitHub"
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Github className="w-6 h-6" />
          </a>
          <a
            href="#"
            aria-label="Instagram"
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Instagram className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
}
