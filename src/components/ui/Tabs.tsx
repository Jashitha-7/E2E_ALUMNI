"use client";

import React from "react";
import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   TABS CONTEXT
   ═══════════════════════════════════════════════════════════════════════════ */
interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: "horizontal" | "vertical";
  indicatorId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within Tabs");
  }
  return context;
};

/* ═══════════════════════════════════════════════════════════════════════════
   TABS ROOT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      orientation = "horizontal",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const value = controlledValue ?? internalValue;
    const indicatorId = React.useId();

    const setValue = React.useCallback(
      (nextValue: string) => {
        setInternalValue(nextValue);
        onValueChange?.(nextValue);
      },
      [onValueChange]
    );

    return (
      <TabsContext.Provider value={{ value, setValue, orientation, indicatorId }}>
        <div
          ref={ref}
          className={cn("w-full", className)}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = "Tabs";

/* ═══════════════════════════════════════════════════════════════════════════
   TABS LIST
   ═══════════════════════════════════════════════════════════════════════════ */
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  fullWidth?: boolean;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, fullWidth = false, children, ...props }, ref) => {
    const { orientation } = useTabsContext();

    return (
      <div
        ref={ref}
        role="tablist"
        data-orientation={orientation}
        className={cn(
          "relative inline-flex items-center gap-1 rounded-2xl",
          "bg-neutral-100/80 dark:bg-neutral-900/80",
          "p-1 backdrop-blur-xl border border-neutral-200/70 dark:border-neutral-800/70",
          fullWidth && "w-full",
          orientation === "vertical" && "flex-col items-stretch",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = "TabsList";

/* ═══════════════════════════════════════════════════════════════════════════
   TABS TRIGGER
   ═══════════════════════════════════════════════════════════════════════════ */
export interface TabsTriggerProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  value: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, icon, children, disabled, ...props }, ref) => {
    const { value: activeValue, setValue, indicatorId } = useTabsContext();
    const isActive = activeValue === value;

    return (
      <motion.button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        disabled={disabled}
        className={cn(
          "relative z-10 inline-flex items-center justify-center gap-2",
          "px-4 py-2 text-sm font-medium rounded-xl",
          "transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          isActive
            ? "text-neutral-900 dark:text-white"
            : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200",
          className
        )}
        onClick={() => !disabled && setValue(value)}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        {...props}
      >
        {isActive && (
          <motion.span
            layoutId={`tabs-indicator-${indicatorId}`}
            className={cn(
              "absolute inset-0 rounded-xl",
              "bg-white dark:bg-neutral-800",
              "shadow-soft-md"
            )}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-2">
          {icon && <span className="w-4 h-4">{icon}</span>}
          {children}
        </span>
      </motion.button>
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

/* ═══════════════════════════════════════════════════════════════════════════
   TABS CONTENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface TabsContentProps extends Omit<HTMLMotionProps<"div">, "children"> {
  value: string;
  forceMount?: boolean;
  children: React.ReactNode;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount = false, children, ...props }, ref) => {
    const { value: activeValue } = useTabsContext();
    const isActive = activeValue === value;

    if (!forceMount && !isActive) {
      return null;
    }

    return (
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            ref={ref}
            key={value}
            role="tabpanel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn("mt-4", className)}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
