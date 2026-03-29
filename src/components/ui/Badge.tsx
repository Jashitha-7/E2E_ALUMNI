"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn, getInitials } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   BADGE VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1 font-medium",
    "transition-colors duration-200",
  ],
  {
    variants: {
      variant: {
        default: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
        primary: "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300",
        secondary: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
        accent: "bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300",
        success: "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300",
        warning: "bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300",
        error: "bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300",
        outline: "bg-transparent border border-current",
        glass: "bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border border-white/20 dark:border-white/10",
      },
      size: {
        sm: "text-xs px-2 py-0.5 rounded-md",
        md: "text-xs px-2.5 py-1 rounded-lg",
        lg: "text-sm px-3 py-1.5 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/* ═══════════════════════════════════════════════════════════════════════════
   BADGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      dot = false,
      removable = false,
      onRemove,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {/* Status dot */}
        {dot && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              variant === "success" && "bg-success-500",
              variant === "warning" && "bg-warning-500",
              variant === "error" && "bg-error-500",
              variant === "primary" && "bg-brand-500",
              variant === "accent" && "bg-accent-500",
              !variant && "bg-neutral-500"
            )}
          />
        )}

        {/* Icon */}
        {icon && <span className="shrink-0">{icon}</span>}

        {/* Content */}
        <span>{children}</span>

        {/* Remove button */}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 -mr-1 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = "Badge";

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const avatarVariants = cva(
  [
    "relative inline-flex items-center justify-center",
    "rounded-full overflow-hidden",
    "font-medium",
    "select-none",
  ],
  {
    variants: {
      size: {
        xs: "w-6 h-6 text-[10px]",
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg",
        "2xl": "w-24 h-24 text-xl",
      },
      variant: {
        default: "bg-gradient-to-br from-brand-500 to-accent-500 text-white",
        neutral: "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200",
        outline: "bg-transparent border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
  fallback?: React.ReactNode;
  ring?: boolean;
  status?: "online" | "offline" | "away" | "busy";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      size,
      variant,
      src,
      alt,
      name,
      fallback,
      ring = false,
      status,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);

    const showFallback = !src || imageError;
    const initials = name ? getInitials(name) : null;

    const statusColors = {
      online: "bg-success-500",
      offline: "bg-neutral-400",
      away: "bg-warning-500",
      busy: "bg-error-500",
    };

    const statusSizes = {
      xs: "w-1.5 h-1.5 border",
      sm: "w-2 h-2 border",
      md: "w-2.5 h-2.5 border-2",
      lg: "w-3 h-3 border-2",
      xl: "w-4 h-4 border-2",
      "2xl": "w-5 h-5 border-2",
    };

    return (
      <div
        ref={ref}
        className={cn(
          avatarVariants({ size, variant }),
          ring && "ring-2 ring-white dark:ring-neutral-900 ring-offset-2 ring-offset-background",
          className
        )}
        {...props}
      >
        {!showFallback ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : fallback ? (
          fallback
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <svg
            className="w-1/2 h-1/2 text-current opacity-70"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-white dark:border-neutral-900",
              statusColors[status],
              statusSizes[size || "md"]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR GROUP
   ═══════════════════════════════════════════════════════════════════════════ */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: VariantProps<typeof avatarVariants>["size"];
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 5, size = "md", className, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const visibleChildren = max ? childArray.slice(0, max) : childArray;
    const remainingCount = max && childArray.length > max ? childArray.length - max : 0;

    const overlapClasses = {
      xs: "-space-x-1.5",
      sm: "-space-x-2",
      md: "-space-x-2.5",
      lg: "-space-x-3",
      xl: "-space-x-4",
      "2xl": "-space-x-6",
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center", overlapClasses[size || "md"], className)}
        {...props}
      >
        {visibleChildren.map((child, index) => {
          if (React.isValidElement<AvatarProps>(child)) {
            return React.cloneElement(child, {
              key: index,
              size,
              ring: true,
              className: cn(child.props.className, "relative"),
              style: { zIndex: visibleChildren.length - index },
            });
          }
          return child;
        })}

        {/* Remaining count */}
        {remainingCount > 0 && (
          <Avatar
            size={size}
            variant="neutral"
            ring
            className="relative"
            style={{ zIndex: 0 }}
          >
            +{remainingCount}
          </Avatar>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING SPINNER
   ═══════════════════════════════════════════════════════════════════════════ */
export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Spinner = ({ size = "md", className }: SpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <svg
        className="w-full h-full text-brand-600"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON
   ═══════════════════════════════════════════════════════════════════════════ */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = "rectangular",
      width,
      height,
      animated = true,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      text: "rounded",
      circular: "rounded-full",
      rectangular: "rounded-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-neutral-200 dark:bg-neutral-800",
          animated && "animate-pulse",
          variantClasses[variant],
          className
        )}
        style={{
          width,
          height: height || (variant === "text" ? "1em" : undefined),
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

/* ═══════════════════════════════════════════════════════════════════════════
   PROGRESS BAR
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ProgressProps {
  value?: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "error" | "gradient";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  indeterminate?: boolean;
  className?: string;
}

const Progress = ({
  value = 0,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  indeterminate = false,
  className,
}: ProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    default: "bg-brand-600",
    success: "bg-success-600",
    warning: "bg-warning-600",
    error: "bg-error-600",
    gradient: "bg-gradient-to-r from-brand-600 to-accent-500",
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden",
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn("h-full rounded-full", variantClasses[variant])}
          initial={{ width: 0 }}
          animate={
            indeterminate
              ? {
                  x: ["-100%", "100%"],
                  width: "30%",
                }
              : { width: `${percentage}%` }
          }
          transition={
            indeterminate
              ? {
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }
              : {
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }
          }
        />
      </div>
      {showLabel && !indeterminate && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

export {
  Badge,
  badgeVariants,
  Avatar,
  AvatarGroup,
  avatarVariants,
  Spinner,
  Skeleton,
  Progress,
};
