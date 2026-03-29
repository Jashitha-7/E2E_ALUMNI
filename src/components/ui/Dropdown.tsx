"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   DROPDOWN MENU VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const dropdownMenuVariants = cva(
  // Base styles
  [
    "absolute z-dropdown",
    "min-w-[180px] py-1",
    "bg-white dark:bg-neutral-900",
    "border border-neutral-200 dark:border-neutral-800",
    "rounded-xl",
    "shadow-soft-xl",
    "overflow-hidden",
  ],
  {
    variants: {
      variant: {
        default: [],
        glass: [
          "bg-white/85 dark:bg-neutral-900/85",
          "backdrop-blur-xl",
          "border-white/20 dark:border-white/10",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const menuAnimationVariants = {
  initial: { opacity: 0, scale: 0.95, y: -8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: {
      duration: 0.15,
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   DROPDOWN CONTEXT
   ═══════════════════════════════════════════════════════════════════════════ */
interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

const useDropdownContext = () => {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a Dropdown");
  }
  return context;
};

/* ═══════════════════════════════════════════════════════════════════════════
   DROPDOWN ROOT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface DropdownProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Dropdown = ({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: DropdownProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (value: boolean) => {
      setInternalOpen(value);
      onOpenChange?.(value);
    },
    [onOpenChange]
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DROPDOWN TRIGGER
   ═══════════════════════════════════════════════════════════════════════════ */
export interface DropdownTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownTrigger = React.forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ className, children, onClick, ...props }, forwardedRef) => {
    const { open, setOpen, triggerRef } = useDropdownContext();

    // Merge refs
    const ref = useCallback(
      (node: HTMLButtonElement) => {
        (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef, triggerRef]
    );

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "transition-colors",
          className
        )}
        onClick={(e) => {
          setOpen(!open);
          onClick?.(e);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        {...props}
      >
        {children}
      </button>
    );
  }
);

DropdownTrigger.displayName = "DropdownTrigger";

/* ═══════════════════════════════════════════════════════════════════════════
   DROPDOWN MENU (Content)
   ═══════════════════════════════════════════════════════════════════════════ */
export interface DropdownMenuProps
  extends VariantProps<typeof dropdownMenuVariants> {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
  sideOffset?: number;
  className?: string;
}

const DropdownMenu = ({
  children,
  variant,
  align = "start",
  side = "bottom",
  sideOffset = 4,
  className,
}: DropdownMenuProps) => {
  const { open } = useDropdownContext();

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  const sideClasses = {
    top: "bottom-full mb-1",
    bottom: "top-full mt-1",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn(
            dropdownMenuVariants({ variant }),
            alignClasses[align],
            sideClasses[side],
            className
          )}
          style={{ marginTop: side === "bottom" ? sideOffset : undefined }}
          variants={menuAnimationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          role="menu"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DROPDOWN ITEM
   ═══════════════════════════════════════════════════════════════════════════ */
export interface DropdownItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  (
    { className, children, icon, shortcut, destructive = false, disabled, onClick, ...props },
    ref
  ) => {
    const { setOpen } = useDropdownContext();

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        disabled={disabled}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2",
          "text-sm text-left",
          "transition-colors",
          "focus:outline-none",
          destructive
            ? "text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/30 focus:bg-error-50 dark:focus:bg-error-950/30"
            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={(e) => {
          if (!disabled) {
            onClick?.(e);
            setOpen(false);
          }
        }}
        {...props}
      >
        {icon && <span className="w-4 h-4 shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
        {shortcut && (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            {shortcut}
          </span>
        )}
      </button>
    );
  }
);

DropdownItem.displayName = "DropdownItem";

/* ═══════════════════════════════════════════════════════════════════════════
   DROPDOWN SEPARATOR
   ═══════════════════════════════════════════════════════════════════════════ */
const DropdownSeparator = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "h-px my-1 bg-neutral-200 dark:bg-neutral-800",
        className
      )}
      role="separator"
    />
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DROPDOWN LABEL
   ═══════════════════════════════════════════════════════════════════════════ */
const DropdownLabel = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "px-3 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400",
        className
      )}
    >
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DROPDOWN CHECKBOX ITEM
   ═══════════════════════════════════════════════════════════════════════════ */
export interface DropdownCheckboxItemProps extends DropdownItemProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const DropdownCheckboxItem = React.forwardRef<
  HTMLButtonElement,
  DropdownCheckboxItemProps
>(({ className, children, checked, onCheckedChange, ...props }, ref) => {
  return (
    <DropdownItem
      ref={ref}
      className={cn("pl-8 relative", className)}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <span className="absolute left-2.5 flex items-center justify-center w-4 h-4">
        {checked && <Check className="w-4 h-4 text-brand-600" />}
      </span>
      {children}
    </DropdownItem>
  );
});

DropdownCheckboxItem.displayName = "DropdownCheckboxItem";

/* ═══════════════════════════════════════════════════════════════════════════
   COMBOBOX / SEARCHABLE SELECT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

const Combobox = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyText = "No results found",
  className,
  disabled,
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Focus input when opening
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <DropdownTrigger
        disabled={disabled}
        className={cn(
          "w-full h-10 px-4 rounded-xl",
          "bg-white dark:bg-neutral-900",
          "border border-neutral-300 dark:border-neutral-700",
          "text-sm text-left",
          "transition-all duration-200",
          "hover:border-neutral-400 dark:hover:border-neutral-600",
          "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <span
          className={cn(
            "flex-1",
            !selectedOption && "text-neutral-400 dark:text-neutral-500"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-neutral-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </DropdownTrigger>

      <DropdownMenu className="w-[var(--trigger-width)] max-h-64 overflow-hidden">
        {/* Search input */}
        <div className="p-2 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                "w-full h-8 !pl-8 pr-3 rounded-lg",
                "bg-neutral-100 dark:bg-neutral-800",
                "text-sm",
                "placeholder:text-neutral-400",
                "focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              )}
            />
          </div>
        </div>

        {/* Options list */}
        <div className="max-h-48 overflow-y-auto py-1">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-6 text-sm text-neutral-500 text-center">
              {emptyText}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2",
                  "text-sm text-left",
                  "transition-colors",
                  "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  option.value === value && "bg-brand-50 dark:bg-brand-950/30",
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => {
                  if (!option.disabled) {
                    onChange?.(option.value);
                    setOpen(false);
                    setSearch("");
                  }
                }}
              >
                {option.icon && <span className="w-4 h-4">{option.icon}</span>}
                <span className="flex-1">{option.label}</span>
                {option.value === value && (
                  <Check className="w-4 h-4 text-brand-600" />
                )}
              </button>
            ))
          )}
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   POPOVER - Generic positioned popup
   ═══════════════════════════════════════════════════════════════════════════ */
export interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: "click" | "hover";
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const Popover = ({
  children,
  content,
  open: controlledOpen,
  onOpenChange,
  trigger = "click",
  align = "center",
  side = "bottom",
  className,
}: PopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (value: boolean) => {
      setInternalOpen(value);
      onOpenChange?.(value);
    },
    [onOpenChange]
  );

  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle hover trigger
  const handleMouseEnter = () => {
    if (trigger === "hover") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      timeoutRef.current = setTimeout(() => setOpen(false), 100);
    }
  };

  const alignClasses = {
    start: side === "top" || side === "bottom" ? "left-0" : "top-0",
    center:
      side === "top" || side === "bottom"
        ? "left-1/2 -translate-x-1/2"
        : "top-1/2 -translate-y-1/2",
    end: side === "top" || side === "bottom" ? "right-0" : "bottom-0",
  };

  const sideClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        onClick={trigger === "click" ? () => setOpen(!open) : undefined}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className={cn(
              "absolute z-popover",
              "bg-white dark:bg-neutral-900",
              "border border-neutral-200 dark:border-neutral-800",
              "rounded-xl shadow-soft-xl",
              alignClasses[align],
              sideClasses[side],
              className
            )}
            variants={menuAnimationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TOOLTIP
   ═══════════════════════════════════════════════════════════════════════════ */
export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delayDuration?: number;
  className?: string;
}

const Tooltip = ({
  children,
  content,
  side = "top",
  delayDuration = 200,
  className,
}: TooltipProps) => {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setOpen(true), delayDuration);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {open && (
          <motion.div
            className={cn(
              "absolute z-tooltip",
              "px-2.5 py-1.5 rounded-lg",
              "bg-neutral-900 dark:bg-neutral-100",
              "text-white dark:text-neutral-900",
              "text-xs font-medium",
              "whitespace-nowrap",
              "shadow-soft-lg",
              sideClasses[side],
              className
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  DropdownCheckboxItem,
  Combobox,
  Popover,
  Tooltip,
  dropdownMenuVariants,
};
