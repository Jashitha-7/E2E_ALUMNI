"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   GLASS PANEL VARIANTS - Premium glassmorphism effects
   ═══════════════════════════════════════════════════════════════════════════ */
const glassPanelVariants = cva(
  // Base glass styles
  [
    "relative",
    "backdrop-blur-xl",
    "border",
    "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
  ],
  {
    variants: {
      variant: {
        // Standard glass
        default: [
          "bg-white/70 dark:bg-neutral-900/70",
          "border-white/20 dark:border-white/10",
          "shadow-glass",
        ],
        // Elevated glass - more opaque
        elevated: [
          "bg-white/85 dark:bg-neutral-900/85",
          "border-white/30 dark:border-white/15",
          "shadow-glass-lg",
        ],
        // Subtle glass - more transparent
        subtle: [
          "bg-white/50 dark:bg-neutral-900/50",
          "border-white/10 dark:border-white/5",
        ],
        // Dark glass - always dark
        dark: [
          "bg-neutral-900/80",
          "border-white/10",
          "shadow-glass",
        ],
        // Light glass - always light
        light: [
          "bg-white/80",
          "border-white/30",
          "shadow-glass",
        ],
        // Frosted - heavy blur
        frosted: [
          "bg-white/40 dark:bg-neutral-900/40",
          "backdrop-blur-2xl",
          "border-white/20 dark:border-white/10",
        ],
        // Gradient glass
        gradient: [
          "bg-gradient-to-br from-white/70 to-white/50 dark:from-neutral-900/70 dark:to-neutral-900/50",
          "border-white/20 dark:border-white/10",
          "shadow-glass",
        ],
      },
      blur: {
        sm: "backdrop-blur-sm",
        md: "backdrop-blur-md",
        lg: "backdrop-blur-lg",
        xl: "backdrop-blur-xl",
        "2xl": "backdrop-blur-2xl",
        "3xl": "backdrop-blur-3xl",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-lg",
        md: "rounded-xl",
        lg: "rounded-2xl",
        xl: "rounded-3xl",
        full: "rounded-full",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
        "2xl": "p-12",
      },
      glow: {
        none: "",
        brand: "shadow-glow-brand",
        accent: "shadow-glow-accent",
        soft: "shadow-soft-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      blur: "xl",
      rounded: "lg",
      padding: "md",
      glow: "none",
    },
  }
);

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const panelMotionVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 },
};

const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   GLASS PANEL PROPS
   ═══════════════════════════════════════════════════════════════════════════ */
export interface GlassPanelProps
  extends Omit<HTMLMotionProps<"div">, "children">,
    VariantProps<typeof glassPanelVariants> {
  children: React.ReactNode;
  animated?: boolean;
  floating?: boolean;
  delay?: number;
  noise?: boolean;
  innerGlow?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   GLASS PANEL COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  (
    {
      className,
      variant,
      blur,
      rounded,
      padding,
      glow,
      animated = false,
      floating = false,
      delay = 0,
      noise = false,
      innerGlow = false,
      children,
      ...props
    },
    ref
  ) => {
    const combinedVariants = floating
      ? {
          ...panelMotionVariants,
          animate: {
            ...panelMotionVariants.animate,
            ...floatVariants.animate,
          },
        }
      : panelMotionVariants;

    return (
      <motion.div
        ref={ref}
        className={cn(
          glassPanelVariants({ variant, blur, rounded, padding, glow }),
          innerGlow && "shadow-inner-glow",
          className
        )}
        variants={animated || floating ? combinedVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated || floating ? "animate" : undefined}
        exit={animated ? "exit" : undefined}
        transition={
          animated
            ? {
                duration: 0.4,
                delay,
                ease: [0.16, 1, 0.3, 1],
              }
            : undefined
        }
        {...props}
      >
        {/* Noise texture overlay */}
        {noise && (
          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none rounded-inherit"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        )}

        {/* Inner border highlight */}
        <div className="absolute inset-0 rounded-inherit border border-white/10 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";

/* ═══════════════════════════════════════════════════════════════════════════
   GLASS CONTAINER - Full-width glass section
   ═══════════════════════════════════════════════════════════════════════════ */
export interface GlassContainerProps extends GlassPanelProps {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  centered?: boolean;
}

const GlassContainer = React.forwardRef<HTMLDivElement, GlassContainerProps>(
  ({ maxWidth = "xl", centered = true, className, children, ...props }, ref) => {
    const maxWidthClasses = {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
    };

    return (
      <GlassPanel
        ref={ref}
        className={cn(
          "w-full",
          maxWidthClasses[maxWidth],
          centered && "mx-auto",
          className
        )}
        {...props}
      >
        {children}
      </GlassPanel>
    );
  }
);

GlassContainer.displayName = "GlassContainer";

/* ═══════════════════════════════════════════════════════════════════════════
   GLASS OVERLAY - Full screen overlay with glass effect
   ═══════════════════════════════════════════════════════════════════════════ */
export interface GlassOverlayProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
}

const GlassOverlay = React.forwardRef<HTMLDivElement, GlassOverlayProps>(
  ({ visible = true, onClose, children, className, ...props }, ref) => {
    if (!visible) return null;

    return (
      <motion.div
        ref={ref}
        className={cn(
          "fixed inset-0 z-modal-backdrop",
          "bg-neutral-900/30 dark:bg-neutral-950/50",
          "backdrop-blur-sm",
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassOverlay.displayName = "GlassOverlay";

/* ═══════════════════════════════════════════════════════════════════════════
   GLASS CARD STACK - Stacked cards with depth effect
   ═══════════════════════════════════════════════════════════════════════════ */
export interface GlassCardStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  layers?: number;
}

const GlassCardStack = React.forwardRef<HTMLDivElement, GlassCardStackProps>(
  ({ children, layers = 2, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {/* Background layers */}
        {Array.from({ length: layers }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 rounded-2xl",
              "bg-white/50 dark:bg-neutral-900/50",
              "border border-white/20 dark:border-white/10",
              "backdrop-blur-lg"
            )}
            style={{
              transform: `translateY(${(i + 1) * 8}px) scale(${1 - (i + 1) * 0.02})`,
              opacity: 1 - (i + 1) * 0.3,
              zIndex: -i - 1,
            }}
          />
        ))}

        {/* Main content */}
        <GlassPanel variant="elevated" rounded="lg" padding="none">
          {children}
        </GlassPanel>
      </div>
    );
  }
);

GlassCardStack.displayName = "GlassCardStack";

/* ═══════════════════════════════════════════════════════════════════════════
   FLOATING GLASS ORB - Decorative floating element
   ═══════════════════════════════════════════════════════════════════════════ */
export interface GlassOrbProps extends Omit<HTMLMotionProps<"div">, "children"> {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "brand" | "accent" | "neutral";
  animated?: boolean;
}

const GlassOrb = React.forwardRef<HTMLDivElement, GlassOrbProps>(
  ({ size = "md", color = "brand", animated = true, className, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-32 h-32",
      md: "w-48 h-48",
      lg: "w-64 h-64",
      xl: "w-96 h-96",
    };

    const colorClasses = {
      brand: "from-brand-500/30 to-brand-600/10",
      accent: "from-accent-500/30 to-accent-600/10",
      neutral: "from-neutral-500/20 to-neutral-600/5",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-full blur-3xl",
          "bg-gradient-to-br",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        animate={
          animated
            ? {
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }
            : undefined
        }
        transition={
          animated
            ? {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : undefined
        }
        {...props}
      />
    );
  }
);

GlassOrb.displayName = "GlassOrb";

export {
  GlassPanel,
  GlassContainer,
  GlassOverlay,
  GlassCardStack,
  GlassOrb,
  glassPanelVariants,
};
