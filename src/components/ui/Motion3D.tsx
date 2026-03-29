"use client";

import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   MOUSE PARALLAX CONTAINER
   ═══════════════════════════════════════════════════════════════════════════ */
export interface MouseParallaxProps {
  children: React.ReactNode;
  intensity?: number;
  perspective?: number;
  className?: string;
}

export const MouseParallax = React.forwardRef<HTMLDivElement, MouseParallaxProps>(
  ({ children, intensity = 20, perspective = 1000, className }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [intensity, -intensity]), {
      stiffness: 300,
      damping: 30,
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-intensity, intensity]), {
      stiffness: 300,
      damping: 30,
    });

    const handleMouseMove = (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    return (
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn("relative", className)}
        style={{ perspective }}
      >
        <motion.div
          ref={ref}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </div>
    );
  }
);

MouseParallax.displayName = "MouseParallax";

/* ═══════════════════════════════════════════════════════════════════════════
   FLOATING ELEMENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface FloatingElementProps {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  delay?: number;
  rotation?: number;
  className?: string;
}

export const FloatingElement = React.forwardRef<HTMLDivElement, FloatingElementProps>(
  (
    { children, duration = 6, distance = 15, delay = 0, rotation = 3, className },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        animate={{
          y: [0, -distance, 0],
          rotate: [-rotation, rotation, -rotation],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay,
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);

FloatingElement.displayName = "FloatingElement";

/* ═══════════════════════════════════════════════════════════════════════════
   DEPTH CARD - Card with 3D depth and shadows
   ═══════════════════════════════════════════════════════════════════════════ */
export interface DepthCardProps {
  children: React.ReactNode;
  depth?: number;
  shadowColor?: string;
  className?: string;
}

export const DepthCard = React.forwardRef<HTMLDivElement, DepthCardProps>(
  ({ children, depth = 8, shadowColor = "rgba(139, 92, 246, 0.15)", className }, ref) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
      stiffness: 400,
      damping: 30,
    });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
      stiffness: 400,
      damping: 30,
    });

    const shadowX = useTransform(x, [-0.5, 0.5], [depth, -depth]);
    const shadowY = useTransform(y, [-0.5, 0.5], [depth, -depth]);

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
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          boxShadow: useMotionValue(
            `${shadowX.get()}px ${shadowY.get()}px 30px ${shadowColor}`
          ),
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "relative transform-gpu",
          "bg-white/5 backdrop-blur-xl",
          "border border-white/10 rounded-3xl",
          "transition-shadow duration-300",
          className
        )}
      >
        {/* Inner glow layer */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${shadowColor} 0%, transparent 50%)`,
          }}
        />
        <div style={{ transform: "translateZ(20px)" }}>{children}</div>
      </motion.div>
    );
  }
);

DepthCard.displayName = "DepthCard";

/* ═══════════════════════════════════════════════════════════════════════════
   ROTATING CARD
   ═══════════════════════════════════════════════════════════════════════════ */
export interface RotatingCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  flipOnHover?: boolean;
  className?: string;
}

export const RotatingCard = React.forwardRef<HTMLDivElement, RotatingCardProps>(
  ({ front, back, flipOnHover = true, className }, ref) => {
    const [isFlipped, setIsFlipped] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn("relative w-full h-full", className)}
        style={{ perspective: 1000 }}
        onMouseEnter={() => flipOnHover && setIsFlipped(true)}
        onMouseLeave={() => flipOnHover && setIsFlipped(false)}
        onClick={() => !flipOnHover && setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ transformStyle: "preserve-3d" }}
          className="w-full h-full"
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden rounded-3xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            {front}
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden rounded-3xl"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {back}
          </div>
        </motion.div>
      </div>
    );
  }
);

RotatingCard.displayName = "RotatingCard";

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "scale";
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
  className?: string;
}

export const ScrollReveal = React.forwardRef<HTMLDivElement, ScrollRevealProps>(
  (
    {
      children,
      direction = "up",
      delay = 0,
      duration = 0.6,
      distance = 50,
      once = true,
      threshold = 0.1,
      className,
    },
    ref
  ) => {
    const [isInView, setIsInView] = React.useState(false);
    const elementRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setIsInView(false);
          }
        },
        { threshold }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }, [once, threshold]);

    const getInitialState = () => {
      switch (direction) {
        case "up":
          return { opacity: 0, y: distance };
        case "down":
          return { opacity: 0, y: -distance };
        case "left":
          return { opacity: 0, x: distance };
        case "right":
          return { opacity: 0, x: -distance };
        case "scale":
          return { opacity: 0, scale: 0.9 };
        default:
          return { opacity: 0, y: distance };
      }
    };

    const getAnimateState = () => {
      switch (direction) {
        case "up":
        case "down":
          return { opacity: 1, y: 0 };
        case "left":
        case "right":
          return { opacity: 1, x: 0 };
        case "scale":
          return { opacity: 1, scale: 1 };
        default:
          return { opacity: 1, y: 0 };
      }
    };

    return (
      <motion.div
        ref={(node) => {
          elementRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        initial={getInitialState()}
        animate={isInView ? getAnimateState() : getInitialState()}
        transition={{
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);

ScrollReveal.displayName = "ScrollReveal";

/* ═══════════════════════════════════════════════════════════════════════════
   MAGNETIC BUTTON
   ═══════════════════════════════════════════════════════════════════════════ */
export interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticButton = React.forwardRef<HTMLDivElement, MagneticButtonProps>(
  ({ children, strength = 30, className }, ref) => {
    const buttonRef = React.useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springX = useSpring(x, { stiffness: 400, damping: 25 });
    const springY = useSpring(y, { stiffness: 400, damping: 25 });

    const handleMouseMove = (e: React.MouseEvent) => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      x.set(distanceX / strength);
      y.set(distanceY / strength);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.div
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        style={{ x: springX, y: springY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn("inline-block cursor-pointer", className)}
      >
        {children}
      </motion.div>
    );
  }
);

MagneticButton.displayName = "MagneticButton";

/* ═══════════════════════════════════════════════════════════════════════════
   GLASS ORB
   ═══════════════════════════════════════════════════════════════════════════ */
export interface GlassOrbProps {
  size?: number;
  color?: string;
  blur?: number;
  floating?: boolean;
  floatDuration?: number;
  floatDistance?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const GlassOrb: React.FC<GlassOrbProps> = ({
  size = 200,
  color = "brand",
  blur = 80,
  floating = true,
  floatDuration = 8,
  floatDistance = 30,
  className,
  style,
}) => {
  const colorMap: Record<string, string> = {
    brand: "rgba(139, 92, 246, 0.4)",
    accent: "rgba(6, 182, 212, 0.4)",
    purple: "rgba(168, 85, 247, 0.4)",
    pink: "rgba(236, 72, 153, 0.4)",
    blue: "rgba(59, 130, 246, 0.4)",
  };

  const bgColor = colorMap[color] || color;

  const orbElement = (
    <div
      className={cn("absolute rounded-full pointer-events-none", className)}
      style={{
        width: size,
        height: size,
        background: bgColor,
        filter: `blur(${blur}px)`,
        ...style,
      }}
    />
  );

  if (floating) {
    return (
      <FloatingElement duration={floatDuration} distance={floatDistance}>
        {orbElement}
      </FloatingElement>
    );
  }

  return orbElement;
};

/* ═══════════════════════════════════════════════════════════════════════════
   PARALLAX LAYER
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "up" | "down";
  className?: string;
}

export const ParallaxLayer = React.forwardRef<HTMLDivElement, ParallaxLayerProps>(
  ({ children, speed = 0.5, direction = "up", className }, ref) => {
    const [offset, setOffset] = React.useState(0);

    React.useEffect(() => {
      const handleScroll = () => {
        const scrollY = window.pageYOffset;
        setOffset(scrollY * speed * (direction === "up" ? -1 : 1));
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, [speed, direction]);

    return (
      <motion.div
        ref={ref}
        style={{ y: offset }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);

ParallaxLayer.displayName = "ParallaxLayer";

/* ═══════════════════════════════════════════════════════════════════════════
   GLOW EFFECT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
  intensity?: number;
  className?: string;
}

export const GlowEffect = React.forwardRef<HTMLDivElement, GlowEffectProps>(
  (
    {
      children,
      color = "rgba(139, 92, 246, 0.5)",
      size = 200,
      intensity = 0.5,
      className,
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = React.useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={cn("relative overflow-hidden", className)}
      >
        <motion.div
          className="absolute pointer-events-none rounded-full"
          animate={{
            opacity: isHovering ? intensity : 0,
            x: mousePos.x - size / 2,
            y: mousePos.y - size / 2,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlowEffect.displayName = "GlowEffect";
