"use client";

import React from "react";
import { motion, type Variants, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION PRESETS - Reusable animation configurations
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Easing functions matching the design system
 */
export const easings = {
  smooth: [0.4, 0, 0.2, 1] as const,
  smoothIn: [0.4, 0, 1, 1] as const,
  smoothOut: [0, 0, 0.2, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  spring: [0.16, 1, 0.3, 1] as const,
};

/**
 * Duration presets
 */
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7,
};

/**
 * Spring configurations
 */
export const springs = {
  snappy: { type: "spring" as const, stiffness: 400, damping: 25 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 20 },
  gentle: { type: "spring" as const, stiffness: 200, damping: 20 },
  slow: { type: "spring" as const, stiffness: 100, damping: 20 },
};

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */

// Fade animations
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: durations.normal } },
  exit: { opacity: 0, transition: { duration: durations.fast } },
};

// Fade up animation
export const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.slow, ease: easings.spring },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: durations.fast },
  },
};

// Fade down animation
export const fadeDownVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.slow, ease: easings.spring },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: durations.fast },
  },
};

// Scale animation
export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.normal, ease: easings.spring },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: durations.fast },
  },
};

// Slide animations
export const slideInLeftVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.slow, ease: easings.spring },
  },
  exit: { opacity: 0, x: -20, transition: { duration: durations.fast } },
};

export const slideInRightVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.slow, ease: easings.spring },
  },
  exit: { opacity: 0, x: 20, transition: { duration: durations.fast } },
};

// Pop animation
export const popVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springs.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: durations.fast },
  },
};

// Stagger container for children animations
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Stagger item
export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.slow, ease: easings.spring },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: durations.fast },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * FadeIn - Fade in animation wrapper
 */
export interface FadeInProps extends MotionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn = React.forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, duration = durations.normal, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration, ease: easings.smooth }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeIn.displayName = "FadeIn";

/**
 * FadeInUp - Fade in with upward motion
 */
export interface FadeInUpProps extends MotionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export const FadeInUp = React.forwardRef<HTMLDivElement, FadeInUpProps>(
  (
    {
      children,
      delay = 0,
      duration = durations.slow,
      distance = 20,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: distance }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration, ease: easings.spring }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeInUp.displayName = "FadeInUp";

/**
 * ScaleIn - Scale in animation
 */
export interface ScaleInProps extends MotionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const ScaleIn = React.forwardRef<HTMLDivElement, ScaleInProps>(
  ({ children, delay = 0, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, ...springs.snappy }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ScaleIn.displayName = "ScaleIn";

/**
 * SlideIn - Slide in from a direction
 */
export interface SlideInProps extends MotionProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  distance?: number;
  className?: string;
}

export const SlideIn = React.forwardRef<HTMLDivElement, SlideInProps>(
  (
    {
      children,
      direction = "left",
      delay = 0,
      distance = 20,
      className,
      ...props
    },
    ref
  ) => {
    const directionMap = {
      left: { x: -distance, y: 0 },
      right: { x: distance, y: 0 },
      up: { x: 0, y: distance },
      down: { x: 0, y: -distance },
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...directionMap[direction] }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay, duration: durations.slow, ease: easings.spring }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
SlideIn.displayName = "SlideIn";

/**
 * Stagger - Container for staggered children animations
 */
export interface StaggerProps extends MotionProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

export const Stagger = React.forwardRef<HTMLDivElement, StaggerProps>(
  (
    { children, staggerDelay = 0.08, delayChildren = 0.1, className, ...props },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={{
          animate: {
            transition: {
              staggerChildren: staggerDelay,
              delayChildren,
            },
          },
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Stagger.displayName = "Stagger";

/**
 * StaggerItem - Item for use inside Stagger container
 */
export interface StaggerItemProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem = React.forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={staggerItemVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerItem.displayName = "StaggerItem";

/**
 * Hover3D - 3D hover effect for cards
 */
export interface Hover3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  intensity?: number;
  glare?: boolean;
}

export const Hover3D = React.forwardRef<HTMLDivElement, Hover3DProps>(
  ({ children, intensity = 15, glare = true, className, ...props }, ref) => {
    const [rotateX, setRotateX] = React.useState(0);
    const [rotateY, setRotateY] = React.useState(0);
    const [glarePosition, setGlarePosition] = React.useState({ x: 50, y: 50 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateXValue = (mouseY / (rect.height / 2)) * -intensity;
      const rotateYValue = (mouseX / (rect.width / 2)) * intensity;

      setRotateX(rotateXValue);
      setRotateY(rotateYValue);

      // Glare position
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      setGlarePosition({ x: glareX, y: glareY });
    };

    const handleMouseLeave = () => {
      setRotateX(0);
      setRotateY(0);
      setGlarePosition({ x: 50, y: 50 });
    };

    return (
      <div
        ref={ref}
        className={cn("relative transform-gpu", className)}
        style={{
          perspective: "1000px",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.div
          animate={{
            rotateX,
            rotateY,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{
            transformStyle: "preserve-3d",
          }}
          className="relative"
        >
          {children}

          {/* Glare effect */}
          {glare && (
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-inherit overflow-hidden"
              style={{
                background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
              }}
              animate={{ opacity: rotateX !== 0 || rotateY !== 0 ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
      </div>
    );
  }
);
Hover3D.displayName = "Hover3D";

/**
 * Parallax - Parallax scrolling effect
 */
export interface ParallaxProps extends MotionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const Parallax = React.forwardRef<HTMLDivElement, ParallaxProps>(
  ({ children, speed = 0.5, className, ...props }, ref) => {
    const [offsetY, setOffsetY] = React.useState(0);

    React.useEffect(() => {
      const handleScroll = () => {
        setOffsetY(window.pageYOffset);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
      <motion.div
        ref={ref}
        style={{ y: offsetY * speed }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Parallax.displayName = "Parallax";

/**
 * AnimatedText - Text reveal animation
 */
export interface AnimatedTextProps {
  text: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  delay?: number;
  staggerDelay?: number;
  animationType?: "word" | "character" | "line";
}

export const AnimatedText = ({
  text,
  tag: Tag = "p",
  className,
  delay = 0,
  staggerDelay = 0.03,
  animationType = "word",
}: AnimatedTextProps) => {
  const elements =
    animationType === "character"
      ? text.split("")
      : animationType === "word"
      ? text.split(" ")
      : [text];

  return (
    <Tag className={cn("overflow-hidden", className)}>
      <motion.span
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: delay,
            },
          },
        }}
        className="inline-flex flex-wrap"
      >
        {elements.map((element, i) => (
          <motion.span
            key={i}
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: easings.spring },
              },
            }}
            className="inline-block"
          >
            {element}
            {animationType === "word" && i < elements.length - 1 && "\u00A0"}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
};

/**
 * CountUp - Animated number counter
 */
export interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export const CountUp = ({
  from = 0,
  to,
  duration = 2,
  delay = 0,
  className,
  formatter = (v) => Math.round(v).toLocaleString(),
}: CountUpProps) => {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (duration * 1000), 1);

        // Easing function (ease out cubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = from + (to - from) * easeProgress;

        setCount(currentValue);

        if (now < endTime) {
          requestAnimationFrame(animate);
        } else {
          setCount(to);
        }
      };

      requestAnimationFrame(animate);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [from, to, duration, delay]);

  return <span className={className}>{formatter(count)}</span>;
};

/**
 * ProgressiveBlur - Blur reveal effect
 */
export interface ProgressiveBlurProps extends MotionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const ProgressiveBlur = React.forwardRef<HTMLDivElement, ProgressiveBlurProps>(
  ({ children, delay = 0, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ filter: "blur(10px)", opacity: 0 }}
        animate={{ filter: "blur(0px)", opacity: 1 }}
        transition={{ delay, duration: 0.6, ease: easings.smooth }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ProgressiveBlur.displayName = "ProgressiveBlur";

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION HOOKS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * useInView animation hook wrapper
 */
export function useAnimateInView(threshold = 0.1) {
  const [ref, setRef] = React.useState<HTMLElement | null>(null);
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref: setRef, isInView };
}

/**
 * Scroll progress hook
 */
export function useScrollProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = window.pageYOffset / scrollHeight;
      setProgress(Math.min(Math.max(scrollProgress, 0), 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}
