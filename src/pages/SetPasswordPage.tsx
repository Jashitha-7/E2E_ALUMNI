"use client";

import React from "react";
import { motion } from "framer-motion";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthField from "@/components/auth/AuthField";
import { Loader2, KeyRound } from "lucide-react";

/**
 * SetPasswordPage - Used by invited alumni/admin to set their password
 * Accessed via invite link with token parameter
 */
export default function SetPasswordPage() {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [touched, setTouched] = React.useState({ password: false, confirm: false });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);

  // Extract token from URL
  const getToken = () => {
    const hash = window.location.hash;
    const match = hash.match(/token=([^&]+)/);
    return match ? match[1] : null;
  };

  const token = getToken();

  const passwordError = touched.password && password.length < 8 ? "Use 8+ characters." : undefined;
  const confirmError = touched.confirm && confirm !== password ? "Passwords do not match." : undefined;
  const passwordSuccess = touched.password && password.length >= 10 ? "Strong password." : undefined;

  const metaEnv = (import.meta as { env?: { VITE_API_URL?: string } }).env;
  const apiBase = metaEnv?.VITE_API_URL ?? "/api/v1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!token) {
      setSubmitError("Invalid or missing invite token.");
      return;
    }

    if (password.length < 8 || confirm !== password) {
      setTouched({ password: true, confirm: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBase}/auth/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to set password");
      }

      // Store tokens
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("userRole");
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      if (data.role) {
        localStorage.setItem("userRole", data.role);
      }

      setSubmitSuccess("Password set successfully! Redirecting...");

      // Redirect based on role
      setTimeout(() => {
        if (data.role === "admin") {
          window.location.hash = "#/admin";
        } else if (data.role === "alumni") {
          window.location.hash = "#/alumni";
        } else {
          window.location.hash = "#/student";
        }
      }, 1500);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to set password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle="This invite link is invalid or has expired."
        footer={
          <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>
            <a
              href="#/login"
              style={{ color: "#c4b5fd", textDecoration: "none" }}
            >
              Go to login
            </a>
          </p>
        }
      >
        <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
          <KeyRound style={{ width: 48, height: 48, margin: "0 auto 16px", opacity: 0.5 }} />
          <p>Please contact an administrator for a new invite link.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set Your Password"
      subtitle="Create a secure password to complete your account setup."
      footer={
        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>
          Already have an account?{" "}
          <a
            href="#/login"
            style={{ color: "#c4b5fd", textDecoration: "none" }}
          >
            Sign in
          </a>
        </p>
      }
    >
      <form style={{ display: "flex", flexDirection: "column", gap: "20px" }} onSubmit={handleSubmit}>
        <AuthField
          id="set-password"
          label="New Password"
          type="password"
          value={password}
          onChange={setPassword}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          error={passwordError}
          success={!passwordError ? passwordSuccess : undefined}
          helperText={!passwordError && !passwordSuccess ? "Minimum 8 characters." : undefined}
          autoComplete="new-password"
          required
        />

        <AuthField
          id="confirm-password"
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
          error={confirmError}
          helperText={!confirmError ? "Re-enter your password." : undefined}
          autoComplete="new-password"
          required
        />

        <motion.button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "14px 24px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
            color: "white",
            fontWeight: 500,
            fontSize: "14px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Setting password..." : "Set Password & Continue"}
        </motion.button>

        {submitError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: "12px", color: "#fda4af", textAlign: "center" }}
          >
            {submitError}
          </motion.p>
        )}
        {submitSuccess && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: "12px", color: "#6ee7b7", textAlign: "center" }}
          >
            {submitSuccess}
          </motion.p>
        )}
      </form>
    </AuthLayout>
  );
}
