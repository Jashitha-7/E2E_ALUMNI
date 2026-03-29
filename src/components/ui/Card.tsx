"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Hover3D } from "./Animations";

/* ═══════════════════════════════════════════════════════════════════════════
   CARD VARIANTS - Premium styling with depth and glassmorphism
   ═══════════════════════════════════════════════════════════════════════════ */
const cardVariants = cva(
  // Base styles
  [
    "rounded-2xl",
    "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
  ],
  {
    variants: {
      variant: {
        // Default card
        default: [
          "bg-white dark:bg-neutral-900",
          "border border-neutral-200 dark:border-neutral-800",
          "shadow-soft-md",
        ],
        // Elevated card with stronger shadow
        elevated: [
          "bg-white dark:bg-neutral-900",
          "border border-neutral-200 dark:border-neutral-800",
          "shadow-soft-lg",
        ],
        // Flat card - subtle background
        flat: [
          "bg-neutral-50 dark:bg-neutral-900/50",
          "border border-neutral-200/50 dark:border-neutral-800/50",
        ],
        // Glass card - glassmorphism
        glass: [
          "bg-white/70 dark:bg-neutral-900/70",
          "backdrop-blur-xl",
          "border border-white/20 dark:border-white/10",
          "shadow-glass",
        ],
        // Glass elevated
        "glass-elevated": [
          "bg-white/85 dark:bg-neutral-900/85",
          "backdrop-blur-2xl",
          "border border-white/30 dark:border-white/15",
          "shadow-glass-lg",
        ],
        // Outline card
        outline: [
          "bg-transparent",
          "border-2 border-neutral-200 dark:border-neutral-700",
        ],
        // Gradient border
        gradient: [
          "bg-white dark:bg-neutral-900",
          "relative overflow-hidden",
          "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
          "before:bg-gradient-to-br before:from-brand-500 before:to-accent-500",
          "before:-z-10",
        ],
      },
      interactive: {
        true: [
          "cursor-pointer",
          "hover:shadow-soft-xl hover:-translate-y-1",
          "hover:border-neutral-300 dark:hover:border-neutral-700",
          "active:scale-[0.99] active:shadow-soft-lg",
        ],
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "none",
    },
    compoundVariants: [
      {
        variant: "glass",
        interactive: true,
        className: "hover:bg-white/80 dark:hover:bg-neutral-900/80",
      },
      {
        variant: "glass-elevated",
        interactive: true,
        className: "hover:bg-white/95 dark:hover:bg-neutral-900/95",
      },
    ],
  }
);

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const cardMotionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  hover: { y: -4, transition: { duration: 0.2 } },
  tap: { scale: 0.99 },
};

/* ═══════════════════════════════════════════════════════════════════════════
   CARD PROPS
   ═══════════════════════════════════════════════════════════════════════════ */
export interface CardProps
  extends Omit<HTMLMotionProps<"div">, "children">,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  animated?: boolean;
  delay?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      interactive,
      padding,
      animated = false,
      delay = 0,
      children,
      ...props
    },
    ref
  ) => {
    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cn(cardVariants({ variant, interactive, padding, className }))}
          variants={cardMotionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          whileHover={interactive ? "hover" : undefined}
          whileTap={interactive ? "tap" : undefined}
          transition={{
            duration: 0.4,
            delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, interactive, padding, className }))}
        whileHover={interactive ? "hover" : undefined}
        whileTap={interactive ? "tap" : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

/* ═══════════════════════════════════════════════════════════════════════════
   CARD HEADER COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, divided = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-6 py-4",
          divided && "border-b border-neutral-200 dark:border-neutral-800",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

/* ═══════════════════════════════════════════════════════════════════════════
   CARD TITLE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold text-neutral-900 dark:text-neutral-100",
        "tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = "CardTitle";

/* ═══════════════════════════════════════════════════════════════════════════
   CARD DESCRIPTION COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-neutral-500 dark:text-neutral-400 mt-1", className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = "CardDescription";

/* ═══════════════════════════════════════════════════════════════════════════
   CARD CONTENT/BODY COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = "CardContent";

/* ═══════════════════════════════════════════════════════════════════════════
   CARD FOOTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, divided = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-6 py-4",
          divided && "border-t border-neutral-200 dark:border-neutral-800",
          "bg-neutral-50/50 dark:bg-neutral-950/30 rounded-b-2xl",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

/* ═══════════════════════════════════════════════════════════════════════════
   CARD IMAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: "video" | "square" | "wide" | "auto";
  overlay?: boolean;
}

const CardImage = React.forwardRef<HTMLDivElement, CardImageProps>(
  ({ className, src, alt, aspectRatio = "video", overlay = false, ...props }, ref) => {
    const aspectClasses = {
      video: "aspect-video",
      square: "aspect-square",
      wide: "aspect-[2/1]",
      auto: "",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-t-2xl",
          aspectClasses[aspectRatio],
          className
        )}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          {...props}
        />
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        )}
      </div>
    );
  }
);

CardImage.displayName = "CardImage";

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE CARD - Pre-styled card for features/services
   ═══════════════════════════════════════════════════════════════════════════ */
export interface FeatureCardProps extends CardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, href, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="glass"
        interactive
        className={cn("group", className)}
        {...props}
      >
        <CardContent className="space-y-4">
          {/* Icon */}
          {icon && (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          )}

          {/* Title */}
          <h4 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {title}
          </h4>

          {/* Description */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {description}
          </p>

          {/* Arrow indicator */}
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Learn more</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

/* ═══════════════════════════════════════════════════════════════════════════
   TILT CARD - 3D hover effect wrapper
   ═══════════════════════════════════════════════════════════════════════════ */
export interface TiltCardProps extends CardProps {
  intensity?: number;
  glare?: boolean;
}

const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(
  ({ intensity = 14, glare = true, className, children, ...props }, ref) => {
    return (
      <Hover3D intensity={intensity} glare={glare} className="rounded-2xl">
        <Card
          ref={ref}
          {...props}
          className={cn("transform-gpu will-change-transform", className)}
        >
          {children}
        </Card>
      </Hover3D>
    );
  }
);

TiltCard.displayName = "TiltCard";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  FeatureCard,
  TiltCard,
  cardVariants,
};
