"use client";

import React, { useEffect, useCallback } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, IconButton } from "./Button";

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const modalVariants = cva(
  // Base styles
  [
    "relative w-full",
    "bg-white dark:bg-neutral-900",
    "shadow-soft-2xl",
    "overflow-hidden",
  ],
  {
    variants: {
      variant: {
        default: [
          "border border-neutral-200 dark:border-neutral-800",
          "rounded-2xl",
        ],
        glass: [
          "bg-white/85 dark:bg-neutral-900/85",
          "backdrop-blur-2xl",
          "border border-white/20 dark:border-white/10",
          "rounded-3xl",
        ],
        fullscreen: [
          "rounded-none h-screen",
        ],
      },
      size: {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        "2xl": "max-w-6xl",
        full: "max-w-[95vw]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalAnimationVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const slideUpVariants = {
  initial: { opacity: 0, y: "100%" },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: {
      duration: 0.2,
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL CONTEXT
   ═══════════════════════════════════════════════════════════════════════════ */
interface ModalContextValue {
  onClose: () => void;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

const useModalContext = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used within a Modal");
  }
  return context;
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL PROPS
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ModalProps extends VariantProps<typeof modalVariants> {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showOverlay?: boolean;
  centered?: boolean;
  animation?: "scale" | "slide-up";
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const Modal = ({
  children,
  open,
  onClose,
  variant,
  size,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showOverlay = true,
  centered = true,
  animation = "scale",
  className,
}: ModalProps) => {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  const animationVariants =
    animation === "slide-up" ? slideUpVariants : modalAnimationVariants;

  return (
    <ModalContext.Provider value={{ onClose }}>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-modal flex">
            {/* Overlay */}
            {showOverlay && (
              <motion.div
                className="fixed inset-0 bg-neutral-900/50 dark:bg-neutral-950/70 backdrop-blur-md backdrop-saturate-150"
                variants={overlayVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={closeOnOverlayClick ? onClose : undefined}
              />
            )}

            {/* Modal container */}
            <div
              className={cn(
                "fixed inset-0 z-modal overflow-y-auto",
                "flex min-h-full",
                centered ? "items-center justify-center p-4" : "items-end sm:items-center justify-center p-4"
              )}
            >
              <motion.div
                className={cn(modalVariants({ variant, size }), className)}
                variants={animationVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                {children}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL HEADER
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, showCloseButton = true, children, ...props }, ref) => {
    const { onClose } = useModalContext();

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start justify-between",
          "px-6 py-4",
          "border-b border-neutral-200 dark:border-neutral-800",
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {showCloseButton && (
          <IconButton
            icon={<X className="w-5 h-5" />}
            variant="ghost"
            size="icon-sm"
            aria-label="Close modal"
            onClick={onClose}
            className="ml-4 -mr-2 -mt-1"
          />
        )}
      </div>
    );
  }
);

ModalHeader.displayName = "ModalHeader";

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL TITLE
   ═══════════════════════════════════════════════════════════════════════════ */
const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn(
        "text-lg font-semibold text-neutral-900 dark:text-neutral-100",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
});

ModalTitle.displayName = "ModalTitle";

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL DESCRIPTION
   ═══════════════════════════════════════════════════════════════════════════ */
const ModalDescription = React.forwardRef<
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

ModalDescription.displayName = "ModalDescription";

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL BODY/CONTENT
   ═══════════════════════════════════════════════════════════════════════════ */
const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("px-6 py-4 flex-1 overflow-y-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
});

ModalBody.displayName = "ModalBody";

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL FOOTER
   ═══════════════════════════════════════════════════════════════════════════ */
const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-3",
        "px-6 py-4",
        "border-t border-neutral-200 dark:border-neutral-800",
        "bg-neutral-50/50 dark:bg-neutral-950/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

ModalFooter.displayName = "ModalFooter";

/* ═══════════════════════════════════════════════════════════════════════════
   ALERT DIALOG - Pre-built confirmation modal
   ═══════════════════════════════════════════════════════════════════════════ */
export interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "info" | "warning" | "error" | "success";
  isLoading?: boolean;
}

const AlertDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: AlertDialogProps) => {
  const icons = {
    info: <Info className="w-6 h-6 text-brand-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-warning-500" />,
    error: <AlertCircle className="w-6 h-6 text-error-500" />,
    success: <CheckCircle className="w-6 h-6 text-success-500" />,
  };

  const buttonVariants = {
    info: "primary" as const,
    warning: "primary" as const,
    error: "destructive" as const,
    success: "success" as const,
  };

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        {/* Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
          {icons[variant]}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariants[variant]}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DRAWER - Side sliding modal
   ═══════════════════════════════════════════════════════════════════════════ */
export interface DrawerProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  position?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showOverlay?: boolean;
  className?: string;
}

const Drawer = ({
  children,
  open,
  onClose,
  position = "right",
  size = "md",
  showOverlay = true,
  className,
}: DrawerProps) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sizeClasses = {
    left: { sm: "w-64", md: "w-80", lg: "w-96", xl: "w-[32rem]", full: "w-screen" },
    right: { sm: "w-64", md: "w-80", lg: "w-96", xl: "w-[32rem]", full: "w-screen" },
    top: { sm: "h-48", md: "h-64", lg: "h-96", xl: "h-[32rem]", full: "h-screen" },
    bottom: { sm: "h-48", md: "h-64", lg: "h-96", xl: "h-[32rem]", full: "h-screen" },
  };

  const positionClasses = {
    left: "left-0 top-0 h-full",
    right: "right-0 top-0 h-full",
    top: "top-0 left-0 w-full",
    bottom: "bottom-0 left-0 w-full",
  };

  const slideVariants = {
    left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
    right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
    top: { initial: { y: "-100%" }, animate: { y: 0 }, exit: { y: "-100%" } },
    bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  };

  return (
    <ModalContext.Provider value={{ onClose }}>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-modal">
            {/* Overlay */}
            {showOverlay && (
              <motion.div
                className="fixed inset-0 bg-neutral-900/50 dark:bg-neutral-950/70 backdrop-blur-sm"
                variants={overlayVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={onClose}
              />
            )}

            {/* Drawer */}
            <motion.div
              className={cn(
                "fixed bg-white dark:bg-neutral-900",
                "shadow-soft-2xl",
                "border-neutral-200 dark:border-neutral-800",
                positionClasses[position],
                sizeClasses[position][size],
                position === "left" && "border-r",
                position === "right" && "border-l",
                position === "top" && "border-b",
                position === "bottom" && "border-t",
                className
              )}
              variants={slideVariants[position]}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  AlertDialog,
  Drawer,
  modalVariants,
};
