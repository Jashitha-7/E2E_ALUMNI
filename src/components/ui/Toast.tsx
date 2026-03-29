"use client";

import React from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const toastVariants = cva(
  [
    "relative w-full max-w-sm rounded-2xl border",
    "bg-white dark:bg-neutral-900",
    "shadow-soft-xl",
    "overflow-hidden",
    "p-4",
  ],
  {
    variants: {
      variant: {
        default: "border-neutral-200 dark:border-neutral-800",
        success: "border-success-200/70 dark:border-success-800/70",
        error: "border-error-200/70 dark:border-error-800/70",
        warning: "border-warning-200/70 dark:border-warning-800/70",
        info: "border-brand-200/70 dark:border-brand-800/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST CONTEXT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: VariantProps<typeof toastVariants>["variant"];
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (toast: Omit<ToastItem, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST PROVIDER
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}

const ToastProvider = ({
  children,
  maxToasts = 4,
  defaultDuration = 4500,
}: ToastProviderProps) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clear = React.useCallback(() => {
    setToasts([]);
  }, []);

  const toast = React.useCallback(
    (input: Omit<ToastItem, "id"> & { id?: string }) => {
      const id = input.id ?? `toast-${Math.random().toString(36).slice(2, 9)}`;
      const duration = input.duration ?? defaultDuration;

      setToasts((prev) => {
        const next = [{ ...input, id }, ...prev];
        return next.slice(0, maxToasts);
      });

      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }

      return id;
    },
    [defaultDuration, dismiss, maxToasts]
  );

  const value = React.useMemo(
    () => ({ toasts, toast, dismiss, clear }),
    [toasts, toast, dismiss, clear]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST VIEWPORT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ToastViewportProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

const ToastViewport = ({
  position = "bottom-right",
  className,
}: ToastViewportProps) => {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  return createPortal(
    <div
      className={cn(
        "fixed z-toast flex flex-col gap-3",
        positionClasses[position],
        className
      )}
      role="status"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
          >
            <div className={cn(toastVariants({ variant: toast.variant }))}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {toast.title}
                  </p>
                  {toast.description && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {toast.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {(toast.actionLabel || toast.onAction) && (
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      toast.onAction?.();
                      dismiss(toast.id);
                    }}
                  >
                    {toast.actionLabel ?? "Action"}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ToastProps extends ToastItem {}

const Toast = (props: ToastProps) => {
  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      onClick={() => toast({ ...props, id: props.id })}
    >
      Show toast
    </Button>
  );
};

export { ToastProvider, ToastViewport, Toast, toastVariants };
