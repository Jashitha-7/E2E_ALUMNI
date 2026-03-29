"use client";

import React from "react";
import { motion } from "framer-motion";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthField from "@/components/auth/AuthField";
import { Loader2 } from "lucide-react";
import { getApiBase } from "@/lib/apiBase";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const readResponsePayload = async (response: Response) => {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as { message?: string; accessToken?: string; refreshToken?: string; role?: string };
  } catch {
    return null;
  }
};

const LoginPage = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [touched, setTouched] = React.useState({ email: false, password: false });
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);

  const emailError = touched.email && !isValidEmail(email) ? "Enter a valid email address." : undefined;
  const passwordError = touched.password && password.length < 6 ? "Password must be at least 6 characters." : undefined;
  const passwordSuccess = touched.password && password.length >= 8 ? "Strong password." : undefined;

  const apiBase = getApiBase();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const hasErrors = !isValidEmail(email) || password.length < 6;
    if (hasErrors) {
      setTouched({ email: true, password: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await readResponsePayload(response);
      if (!response.ok) {
        throw new Error(data?.message || "Unable to sign in. Please check if backend API is running.");
      }

      if (!data) {
        throw new Error("Unexpected empty response from server.");
      }

      if (data?.accessToken) {
        const storage = rememberMe ? localStorage : sessionStorage;
        const otherStorage = rememberMe ? sessionStorage : localStorage;

        otherStorage.removeItem("accessToken");
        otherStorage.removeItem("refreshToken");
        otherStorage.removeItem("userRole");

        storage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) storage.setItem("refreshToken", data.refreshToken);
        if (data.role) storage.setItem("userRole", data.role);
      }

      setSubmitSuccess("Signed in successfully. Redirecting...");

      // Redirect based on role
      setTimeout(() => {
        if (data.role === "admin") {
          window.location.hash = "#/admin";
        } else if (data.role === "alumni") {
          window.location.hash = "#/alumni";
        } else {
          window.location.hash = "#/student";
        }
      }, 1000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      
      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to reconnect with your alumni network."
        footer={
        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>
          New here?{" "}
          <a 
            href="#/register" 
            style={{ 
              color: "#c4b5fd", 
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#ddd6fe"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#c4b5fd"}
          >
            Create an account
          </a>
        </p>
      }
    >
      <form
        style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative", zIndex: 30, pointerEvents: "auto" }}
        onSubmit={handleSubmit}
      >
        <AuthField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={emailError}
          helperText={!emailError ? "Use your alumni email or personal inbox." : undefined}
          autoComplete="email"
          required
        />

        <AuthField
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          error={passwordError}
          success={!passwordError ? passwordSuccess : undefined}
          helperText={!passwordError && !passwordSuccess ? "Use at least 6 characters." : undefined}
          autoComplete="current-password"
          required
        />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#cbd5e1",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              style={{
                width: "16px",
                height: "16px",
                accentColor: "#8b5cf6",
                cursor: "pointer",
              }}
            />
            Remember me
          </label>
          <a 
            href="#/forgot"
            style={{ 
              color: "#c4b5fd", 
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#ddd6fe"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#c4b5fd"}
          >
            Forgot password?
          </a>
        </motion.div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "auto",
            minWidth: "140px",
            padding: "8px 24px",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
            color: "white",
            fontWeight: 500,
            fontSize: "13px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            margin: "0 auto",
          }}
          whileHover={{ 
            scale: 1.02, 
            boxShadow: "0 0 25px rgba(139, 92, 246, 0.5)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isSubmitting ? "Signing in..." : "Sign in"}
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
    </>
  );
};

export default LoginPage;
