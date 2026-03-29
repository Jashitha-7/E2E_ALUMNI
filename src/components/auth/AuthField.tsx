"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import { useState } from "react";

export interface AuthFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string;
  success?: string;
  helperText?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
}

const AuthField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  success,
  helperText,
  autoComplete,
  required,
  disabled,
}: AuthFieldProps) => {
  const status = error ? "error" : success ? "success" : "default";
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (status === "error") return "rgba(244, 63, 94, 0.6)";
    if (status === "success") return "rgba(16, 185, 129, 0.5)";
    if (isFocused) return "rgba(139, 92, 246, 0.7)";
    return "rgba(255, 255, 255, 0.15)";
  };

  const getGlowShadow = () => {
    if (!isFocused) return "none";
    if (status === "error") return "0 0 20px -5px rgba(244, 63, 94, 0.5), 0 0 40px -10px rgba(244, 63, 94, 0.3)";
    if (status === "success") return "0 0 20px -5px rgba(16, 185, 129, 0.5), 0 0 40px -10px rgba(16, 185, 129, 0.3)";
    return "0 0 20px -5px rgba(139, 92, 246, 0.5), 0 0 40px -10px rgba(139, 92, 246, 0.3)";
  };

  return (
    <div className="space-y-2" style={{ width: "calc(100% - 40px)", margin: "0 auto" }}>
      <motion.div
        className="group relative overflow-hidden"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${getBorderColor()}`,
          boxShadow: getGlowShadow(),
          borderRadius: "24px",
        }}
        animate={{
          borderColor: getBorderColor(),
          boxShadow: getGlowShadow(),
        }}
        transition={{ duration: 0.3 }}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder=" "
          className="peer w-full rounded-2xl bg-transparent px-4 pb-2 pt-6 text-sm text-white outline-none placeholder:text-transparent disabled:cursor-not-allowed disabled:opacity-60 pointer-events-auto"
        />

        <motion.label
          htmlFor={id}
          className="pointer-events-none absolute left-4 text-sm transition-all duration-200"
          style={{
            color: isFocused ? "#c4b5fd" : "#94a3b8",
          }}
          animate={{
            top: isFocused || value ? "12px" : "50%",
            translateY: isFocused || value ? "0%" : "-50%",
            fontSize: isFocused || value ? "12px" : "14px",
            color: isFocused ? "#c4b5fd" : "#94a3b8",
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
          {required && <span style={{ color: "#fb7185" }}> *</span>}
        </motion.label>

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          {status === "error" && <AlertCircle className="h-4 w-4" style={{ color: "#fb7185" }} />}
          {status === "success" && <Check className="h-4 w-4" style={{ color: "#34d399" }} />}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {(error || success || helperText) && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              fontSize: "12px",
              color: status === "error" ? "#fda4af" : status === "success" ? "#6ee7b7" : "#94a3b8",
            }}
          >
            {error || success || helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthField;
