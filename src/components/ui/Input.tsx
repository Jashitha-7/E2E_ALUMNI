"use client";

import React, { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Search, X, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   INPUT VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const inputVariants = cva(
  // Base styles
  [
    "flex w-full",
    "bg-white dark:bg-neutral-900",
    "border border-neutral-300 dark:border-neutral-700",
    "text-neutral-900 dark:text-neutral-100",
    "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
    "transition-all duration-200",
    "focus:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "disabled:bg-neutral-100 dark:disabled:bg-neutral-800",
  ],
  {
    variants: {
      variant: {
        default: [
          "focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
        ],
        glass: [
          "bg-white/50 dark:bg-neutral-900/50",
          "backdrop-blur-lg",
          "border-white/20 dark:border-white/10",
          "focus:ring-2 focus:ring-white/30 focus:border-white/30",
        ],
        filled: [
          "bg-neutral-100 dark:bg-neutral-800",
          "border-transparent",
          "focus:bg-white dark:focus:bg-neutral-900",
          "focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
        ],
        outline: [
          "bg-transparent",
          "border-2 border-neutral-300 dark:border-neutral-600",
          "focus:border-brand-500 dark:focus:border-brand-400",
        ],
      },
      inputSize: {
        sm: "h-8 px-3 text-sm rounded-lg",
        md: "h-10 px-4 text-sm rounded-xl",
        lg: "h-12 px-5 text-base rounded-xl",
        xl: "h-14 px-6 text-lg rounded-2xl",
      },
      state: {
        default: "",
        error: [
          "border-error-500 dark:border-error-500",
          "focus:ring-error-500/20 focus:border-error-500",
        ],
        success: [
          "border-success-500 dark:border-success-500",
          "focus:ring-success-500/20 focus:border-success-500",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
      state: "default",
    },
  }
);

/* ═══════════════════════════════════════════════════════════════════════════
   INPUT PROPS
   ═══════════════════════════════════════════════════════════════════════════ */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INPUT COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      variant,
      inputSize,
      state,
      label,
      helperText,
      errorMessage,
      successMessage,
      leftIcon,
      rightIcon,
      required,
      showClearButton,
      onClear,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const hasValue = value !== undefined && value !== "";
    const currentState = errorMessage ? "error" : successMessage ? "success" : state;
    const message = errorMessage || successMessage || helperText;

    return (
      <div className="w-full space-y-2">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
            {required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            value={value}
            className={cn(
              inputVariants({ variant, inputSize, state: currentState }),
              leftIcon && "!pl-10",
              (rightIcon || showClearButton) && "pr-10",
              className
            )}
            {...props}
          />

          {/* Right icon or clear button */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {showClearButton && hasValue && !disabled && (
              <button
                type="button"
                onClick={onClear}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {rightIcon && !showClearButton && (
              <span className="text-neutral-400">{rightIcon}</span>
            )}
            {currentState === "error" && (
              <AlertCircle className="w-4 h-4 text-error-500" />
            )}
            {currentState === "success" && (
              <Check className="w-4 h-4 text-success-500" />
            )}
          </div>
        </div>

        {/* Helper/error/success text */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={cn(
                "text-xs",
                currentState === "error" && "text-error-500",
                currentState === "success" && "text-success-500",
                currentState === "default" && "text-neutral-500 dark:text-neutral-400"
              )}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";

/* ═══════════════════════════════════════════════════════════════════════════
   PASSWORD INPUT COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH INPUT COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface SearchInputProps extends Omit<InputProps, "type" | "leftIcon"> {
  onSearch?: (value: string) => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onClear, className, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState("");
    const value = props.value ?? internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      props.onChange?.(e);
    };

    const handleClear = () => {
      setInternalValue("");
      onClear?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch(String(value));
      }
      props.onKeyDown?.(e);
    };

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<Search className="w-4 h-4" />}
        showClearButton
        value={value}
        onChange={handleChange}
        onClear={handleClear}
        onKeyDown={handleKeyDown}
        placeholder={props.placeholder ?? "Search..."}
        className={cn("pr-20", className)}
        {...props}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";

/* ═══════════════════════════════════════════════════════════════════════════
   TEXTAREA COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "children">,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  required?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      state,
      label,
      helperText,
      errorMessage,
      successMessage,
      required,
      showCharCount,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const currentState = errorMessage ? "error" : successMessage ? "success" : state;
    const message = errorMessage || successMessage || helperText;
    const charCount = String(value || "").length;

    return (
      <div className="w-full space-y-2">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
            {required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            inputVariants({ variant, state: currentState }),
            "min-h-[120px] py-3 resize-y rounded-xl",
            className
          )}
          {...props}
        />

        {/* Footer row */}
        <div className="flex items-center justify-between">
          {/* Helper/error/success text */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={cn(
                  "text-xs",
                  currentState === "error" && "text-error-500",
                  currentState === "success" && "text-success-500",
                  currentState === "default" && "text-neutral-500 dark:text-neutral-400"
                )}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Character count */}
          {showCharCount && maxLength && (
            <p
              className={cn(
                "text-xs",
                charCount > maxLength * 0.9
                  ? "text-warning-500"
                  : "text-neutral-400"
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

/* ═══════════════════════════════════════════════════════════════════════════
   SELECT COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant,
      inputSize,
      state,
      label,
      helperText,
      errorMessage,
      options,
      placeholder,
      required,
      ...props
    },
    ref
  ) => {
    const currentState = errorMessage ? "error" : state;
    const message = errorMessage || helperText;

    return (
      <div className="w-full space-y-2">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
            {required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}

        {/* Select */}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              inputVariants({ variant, inputSize, state: currentState }),
              "appearance-none cursor-pointer pr-10",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Helper/error text */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={cn(
                "text-xs",
                currentState === "error"
                  ? "text-error-500"
                  : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Select.displayName = "Select";

/* ═══════════════════════════════════════════════════════════════════════════
   CHECKBOX COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${React.useId()}`;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              "peer w-5 h-5 rounded-md border-2 border-neutral-300 dark:border-neutral-600",
              "bg-white dark:bg-neutral-900",
              "transition-all duration-200",
              "checked:bg-brand-600 checked:border-brand-600",
              "focus:ring-2 focus:ring-brand-500/20 focus:ring-offset-2",
              "cursor-pointer",
              "appearance-none",
              className
            )}
            {...props}
          />
          {/* Checkmark */}
          <Check className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

/* ═══════════════════════════════════════════════════════════════════════════
   TOGGLE/SWITCH COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, size = "md", id, checked, ...props }, ref) => {
    const toggleId = id || `toggle-${React.useId()}`;

    const sizeClasses = {
      sm: { track: "h-5 w-9", thumb: "h-3 w-3", translate: "translate-x-4" },
      md: { track: "h-6 w-11", thumb: "h-4 w-4", translate: "translate-x-5" },
      lg: { track: "h-7 w-14", thumb: "h-5 w-5", translate: "translate-x-7" },
    };

    return (
      <div className="flex items-center gap-3">
        <label htmlFor={toggleId} className="relative inline-flex cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          {/* Track */}
          <div
            className={cn(
              "rounded-full",
              "bg-neutral-200 dark:bg-neutral-700",
              "peer-checked:bg-brand-600",
              "transition-colors duration-200",
              sizeClasses[size].track
            )}
          />
          {/* Thumb */}
          <motion.div
            className={cn(
              "absolute top-1 left-1 rounded-full",
              "bg-white shadow-soft-sm",
              sizeClasses[size].thumb
            )}
            animate={{
              x: checked ? parseInt(sizeClasses[size].translate.split("-x-")[1]) * 4 : 0,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </label>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {label}
              </span>
            )}
            {description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = "Toggle";

export {
  Input,
  PasswordInput,
  SearchInput,
  Textarea,
  Select,
  Checkbox,
  Toggle,
  inputVariants,
};
