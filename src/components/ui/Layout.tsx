"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassOrb } from "./GlassPanel";

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE LAYOUT - Main wrapper for pages
   ═══════════════════════════════════════════════════════════════════════════ */
export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  centered?: boolean;
}

const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  (
    {
      children,
      maxWidth = "xl",
      padding = "md",
      centered = true,
      className,
      ...props
    },
    ref
  ) => {
    const maxWidthClasses = {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
    };

    const paddingClasses = {
      none: "",
      sm: "px-4 py-6 md:px-6 md:py-8",
      md: "px-4 py-8 md:px-8 md:py-12",
      lg: "px-6 py-12 md:px-12 md:py-16",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full min-h-screen",
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          centered && "mx-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PageLayout.displayName = "PageLayout";

/* ═══════════════════════════════════════════════════════════════════════════
   CONTAINER - Generic content container
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, size = "xl", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
    };

    return (
      <div
        ref={ref}
        className={cn("w-full mx-auto px-4 md:px-6", sizeClasses[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION - Page section with optional heading
   ═══════════════════════════════════════════════════════════════════════════ */
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  title?: string;
  description?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  background?: "none" | "subtle" | "muted" | "glass";
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      title,
      description,
      padding = "lg",
      background = "none",
      className,
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      none: "",
      sm: "py-8 md:py-12",
      md: "py-12 md:py-16",
      lg: "py-16 md:py-24",
      xl: "py-24 md:py-32",
    };

    const backgroundClasses = {
      none: "",
      subtle: "bg-neutral-50/50 dark:bg-neutral-950/50",
      muted: "bg-neutral-100 dark:bg-neutral-900",
      glass: "bg-white/50 dark:bg-neutral-900/50 backdrop-blur-lg",
    };

    return (
      <section
        ref={ref}
        className={cn(paddingClasses[padding], backgroundClasses[background], className)}
        {...props}
      >
        {(title || description) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="text-display-md md:text-display-lg text-neutral-900 dark:text-white mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

/* ═══════════════════════════════════════════════════════════════════════════
   GRID - Responsive grid layout
   ═══════════════════════════════════════════════════════════════════════════ */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "none" | "sm" | "md" | "lg" | "xl";
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ children, cols = 3, gap = "md", className, ...props }, ref) => {
    const colsClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
      6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    };

    const gapClasses = {
      none: "gap-0",
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-12",
    };

    return (
      <div
        ref={ref}
        className={cn("grid", colsClasses[cols], gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

/* ═══════════════════════════════════════════════════════════════════════════
   STACK - Vertical stack with spacing
   ═══════════════════════════════════════════════════════════════════════════ */
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ children, gap = "md", align = "stretch", className, ...props }, ref) => {
    const gapClasses = {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    };

    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col", gapClasses[gap], alignClasses[align], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = "Stack";

/* ═══════════════════════════════════════════════════════════════════════════
   INLINE - Horizontal layout with wrapping
   ═══════════════════════════════════════════════════════════════════════════ */
export interface InlineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: boolean;
}

const Inline = React.forwardRef<HTMLDivElement, InlineProps>(
  (
    {
      children,
      gap = "md",
      align = "center",
      justify = "start",
      wrap = true,
      className,
      ...props
    },
    ref
  ) => {
    const gapClasses = {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    };

    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
      stretch: "items-stretch",
    };

    const justifyClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          wrap && "flex-wrap",
          gapClasses[gap],
          alignClasses[align],
          justifyClasses[justify],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Inline.displayName = "Inline";

/* ═══════════════════════════════════════════════════════════════════════════
   CENTER - Center content both horizontally and vertically
   ═══════════════════════════════════════════════════════════════════════════ */
const Center = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </div>
  );
});

Center.displayName = "Center";

/* ═══════════════════════════════════════════════════════════════════════════
   SPACER - Flexible space element
   ═══════════════════════════════════════════════════════════════════════════ */
export interface SpacerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  axis?: "horizontal" | "vertical";
}

const Spacer = ({ size = "md", axis = "vertical" }: SpacerProps) => {
  const sizeClasses = {
    xs: axis === "vertical" ? "h-2" : "w-2",
    sm: axis === "vertical" ? "h-4" : "w-4",
    md: axis === "vertical" ? "h-6" : "w-6",
    lg: axis === "vertical" ? "h-8" : "w-8",
    xl: axis === "vertical" ? "h-12" : "w-12",
    "2xl": axis === "vertical" ? "h-16" : "w-16",
  };

  return <div className={sizeClasses[size]} />;
};

/* ═══════════════════════════════════════════════════════════════════════════
   DIVIDER
   ═══════════════════════════════════════════════════════════════════════════ */
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed" | "gradient";
  label?: string;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    { orientation = "horizontal", variant = "solid", label, className, ...props },
    ref
  ) => {
    const baseClasses =
      orientation === "horizontal"
        ? "w-full h-px"
        : "h-full w-px";

    const variantClasses = {
      solid: "bg-neutral-200 dark:bg-neutral-800",
      dashed: "border-dashed border-neutral-200 dark:border-neutral-800",
      gradient:
        "bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-700 to-transparent",
    };

    if (label) {
      return (
        <div
          ref={ref}
          className={cn("flex items-center gap-4", className)}
          {...props}
        >
          <div className={cn("flex-1 h-px", variantClasses[variant])} />
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {label}
          </span>
          <div className={cn("flex-1 h-px", variantClasses[variant])} />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";

/* ═══════════════════════════════════════════════════════════════════════════
   ASPECT RATIO BOX
   ═══════════════════════════════════════════════════════════════════════════ */
export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: "square" | "video" | "wide" | "portrait" | number;
  children: React.ReactNode;
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = "video", children, className, ...props }, ref) => {
    const ratioClasses = {
      square: "aspect-square",
      video: "aspect-video",
      wide: "aspect-[2/1]",
      portrait: "aspect-[3/4]",
    };

    const aspectClass =
      typeof ratio === "number" ? undefined : ratioClasses[ratio];

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", aspectClass, className)}
        style={typeof ratio === "number" ? { aspectRatio: ratio } : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AspectRatio.displayName = "AspectRatio";

/* ═══════════════════════════════════════════════════════════════════════════
   HERO SECTION - Premium hero with gradient background
   ═══════════════════════════════════════════════════════════════════════════ */
export interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  gradient?: boolean;
  orbs?: boolean;
  centered?: boolean;
}

const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  (
    {
      title,
      subtitle,
      description,
      children,
      gradient = true,
      orbs = true,
      centered = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative min-h-[60vh] flex items-center py-24 md:py-32 overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Background gradient */}
        {gradient && (
          <div className="absolute inset-0 bg-gradient-mesh opacity-50 dark:opacity-30" />
        )}

        {/* Decorative orbs */}
        {orbs && (
          <>
            <GlassOrb
              size="xl"
              color="brand"
              className="absolute -top-20 -left-20 opacity-30"
            />
            <GlassOrb
              size="lg"
              color="accent"
              className="absolute -bottom-10 -right-10 opacity-20"
            />
          </>
        )}

        {/* Content */}
        <Container className={cn("relative z-10", centered && "text-center")}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Subtitle */}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-brand-600 dark:text-brand-400 font-medium text-sm md:text-base mb-4 tracking-wide uppercase"
              >
                {subtitle}
              </motion.p>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={cn(
                "text-display-xl md:text-display-2xl font-bold",
                "text-neutral-900 dark:text-white",
                "mb-6",
                centered && "max-w-4xl mx-auto"
              )}
            >
              {title}
            </motion.h1>

            {/* Description */}
            {description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={cn(
                  "text-body-lg md:text-body-xl text-neutral-600 dark:text-neutral-400",
                  "mb-8",
                  centered && "max-w-2xl mx-auto"
                )}
              >
                {description}
              </motion.p>
            )}

            {/* Actions */}
            {children && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className={cn(centered && "flex justify-center")}
              >
                {children}
              </motion.div>
            )}
          </motion.div>
        </Container>
      </section>
    );
  }
);

HeroSection.displayName = "HeroSection";

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR LAYOUT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  sidebarPosition?: "left" | "right";
  sidebarWidth?: "sm" | "md" | "lg";
  collapsible?: boolean;
  collapsed?: boolean;
}

const SidebarLayout = React.forwardRef<HTMLDivElement, SidebarLayoutProps>(
  (
    {
      children,
      sidebar,
      sidebarPosition = "left",
      sidebarWidth = "md",
      collapsible = false,
      collapsed = false,
      className,
      ...props
    },
    ref
  ) => {
    const sidebarWidthClasses = {
      sm: collapsed ? "w-16" : "w-56",
      md: collapsed ? "w-16" : "w-64",
      lg: collapsed ? "w-16" : "w-80",
    };

    return (
      <div
        ref={ref}
        className={cn("flex min-h-screen", className)}
        {...props}
      >
        {sidebarPosition === "left" && (
          <aside
            className={cn(
              "shrink-0 border-r border-neutral-200 dark:border-neutral-800",
              "bg-white dark:bg-neutral-900",
              "transition-all duration-300",
              sidebarWidthClasses[sidebarWidth]
            )}
          >
            {sidebar}
          </aside>
        )}

        <main className="flex-1 min-w-0">{children}</main>

        {sidebarPosition === "right" && (
          <aside
            className={cn(
              "shrink-0 border-l border-neutral-200 dark:border-neutral-800",
              "bg-white dark:bg-neutral-900",
              "transition-all duration-300",
              sidebarWidthClasses[sidebarWidth]
            )}
          >
            {sidebar}
          </aside>
        )}
      </div>
    );
  }
);

SidebarLayout.displayName = "SidebarLayout";

export {
  PageLayout,
  Container,
  Section,
  Grid,
  Stack,
  Inline,
  Center,
  Spacer,
  Divider,
  AspectRatio,
  HeroSection,
  SidebarLayout,
};
