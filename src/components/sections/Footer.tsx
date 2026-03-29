import { motion } from 'framer-motion';
import { 
  Github, Twitter, Linkedin, Instagram, Mail, Phone, MapPin,
  ArrowUp, Heart
} from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Security', href: '#security' },
    { name: 'Roadmap', href: '#roadmap' },
  ],
  company: [
    { name: 'About Us', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Press Kit', href: '#press' },
    { name: 'Contact', href: '#contact' },
  ],
  resources: [
    { name: 'Documentation', href: '#docs' },
    { name: 'Help Center', href: '#help' },
    { name: 'Blog', href: '#blog' },
    { name: 'Community', href: '#community' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'GDPR', href: '#gdpr' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative pt-24 pb-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 to-black" />
      
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-10 sm:px-12 lg:px-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {/* Brand column */}
          <div className="col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row md:items-start md:justify-between gap-6"
            >
              <div>
                {/* Logo */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">A</span>
                  </div>
                  <span className="text-xl font-bold text-white">Alumni Platform</span>
                </div>
                
                <p className="text-white/60 max-w-xs leading-relaxed">
                  Connecting alumni worldwide. Building lasting relationships and 
                  unlocking opportunities that matter.
                </p>
              </div>
              
              {/* Social links */}
              <div className="flex gap-4 md:ml-auto">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-8 mb-12 text-sm text-white/60"
        >
          <a href="mailto:hello@alumni.com" className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail className="w-4 h-4" />
            hello@alumni.com
          </a>
          <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone className="w-4 h-4" />
            +1 (234) 567-890
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            San Francisco, CA
          </span>
        </motion.div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-white/40 mb-4 md:mb-0 flex items-center gap-1"
          >
            © 2026 Alumni Association Platform. Made with{' '}
            <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for alumni worldwide.
          </motion.p>
          
          {/* Scroll to top */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
