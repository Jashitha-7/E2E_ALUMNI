"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   BUTTON VARIANTS - Premium SaaS styling with glassmorphism
   ═══════════════════════════════════════════════════════════════════════════ */
const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium text-sm",
    "rounded-xl",
    "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98] active:translate-y-[1px]",
    "hover:shadow-soft-md",
    "select-none",
  ],
  {
    variants: {
      variant: {
        // Primary - Gradient brand button
        primary: [
          "bg-gradient-to-r from-brand-600 to-brand-500",
          "text-white shadow-soft-md",
          "hover:shadow-glow-brand hover:from-brand-700 hover:to-brand-600",
          "focus-visible:ring-brand-500",
        ],
        // Secondary - Subtle neutral
        secondary: [
          "bg-neutral-100 dark:bg-neutral-800",
          "text-neutral-900 dark:text-neutral-100",
          "border border-neutral-200 dark:border-neutral-700",
          "hover:bg-neutral-200 dark:hover:bg-neutral-700",
          "hover:shadow-soft-md",
          "focus-visible:ring-neutral-400",
        ],
        // Ghost - Transparent
        ghost: [
          "bg-transparent",
          "text-neutral-700 dark:text-neutral-300",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "focus-visible:ring-neutral-400",
        ],
        // Glass - Glassmorphism style
        glass: [
          "bg-white/70 dark:bg-neutral-900/70",
          "backdrop-blur-xl",
          "border border-white/20 dark:border-white/10",
          "text-neutral-900 dark:text-white",
          "shadow-glass",
          "hover:bg-white/90 dark:hover:bg-neutral-800/90",
          "focus-visible:ring-white/50",
        ],
        // Outline - Border only
        outline: [
          "bg-transparent",
          "border-2 border-brand-500",
          "text-brand-600 dark:text-brand-400",
          "hover:bg-brand-50 dark:hover:bg-brand-950/30",
          "focus-visible:ring-brand-500",
        ],
        // Destructive - Error/danger
        destructive: [
          "bg-error-600 text-white",
          "hover:bg-error-700",
          "hover:shadow-glow-error",
          "focus-visible:ring-error-500",
        ],
        // Accent - Secondary brand color
        accent: [
          "bg-gradient-to-r from-accent-500 to-accent-400",
          "text-white shadow-soft-md",
          "hover:shadow-glow-accent hover:from-accent-600 hover:to-accent-500",
          "focus-visible:ring-accent-500",
        ],
        // Success
        success: [
          "bg-success-600 text-white",
          "hover:bg-success-700",
          "hover:shadow-glow-success",
          "focus-visible:ring-success-500",
        ],
        // Link - Text link style
        link: [
          "bg-transparent",
          "text-brand-600 dark:text-brand-400",
          "underline-offset-4 hover:underline",
          "focus-visible:ring-brand-500",
          "p-0 h-auto",
        ],
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-lg gap-1",
        sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-11 px-5 text-sm gap-2",
        xl: "h-12 px-6 text-base gap-2.5 rounded-2xl",
        "2xl": "h-14 px-8 text-lg gap-3 rounded-2xl",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-lg",
        "icon-lg": "h-12 w-12 p-0 rounded-xl",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const buttonMotionVariants = {
  initial: { scale: 1, y: 0 },
  hover: { scale: 1.03, y: -1 },
  tap: { scale: 0.98, y: 1 },
};

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: "linear" as const,
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   BUTTON PROPS
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BUTTON COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={isDisabled}
        variants={buttonMotionVariants}
        initial="initial"
        whileHover={!isDisabled ? "hover" : undefined}
        whileTap={!isDisabled ? "tap" : undefined}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <motion.span
            variants={spinnerVariants}
            animate="animate"
            className="shrink-0"
          >
            <Loader2 className="h-4 w-4" />
          </motion.span>
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="shrink-0">{leftIcon}</span>
        )}

        {/* Button content */}
        <span className={cn(isLoading && !loadingText && "opacity-0")}>
          {isLoading && loadingText ? loadingText : children}
        </span>

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

/* ═══════════════════════════════════════════════════════════════════════════
   ICON BUTTON COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface IconButtonProps
  extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "children"> {
  icon: React.ReactNode;
  "aria-label": string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "icon", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn("aspect-square", className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

/* ═══════════════════════════════════════════════════════════════════════════
   BUTTON GROUP COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  attached?: boolean;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, attached = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          attached
            ? "[&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:not(:first-child)]:-ml-px"
            : "gap-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

export { Button, IconButton, ButtonGroup, buttonVariants };
