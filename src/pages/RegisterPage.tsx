"use client";

import React from "react";
import { motion } from "framer-motion";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthField from "@/components/auth/AuthField";
import { Loader2, GraduationCap } from "lucide-react";
import { getApiBase } from "@/lib/apiBase";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const readResponsePayload = async (response: Response) => {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as { message?: string };
  } catch {
    return null;
  }
};

const getDirectLocalApiBase = () => {
  if (typeof window === "undefined") return null;

  const { hostname } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  return isLocalHost ? "http://localhost:5000/api/v1" : null;
};

const RegisterPage = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [touched, setTouched] = React.useState({ name: false, email: false, password: false, confirm: false });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);

  const nameError = touched.name && name.trim().length < 2 ? "Please enter your full name." : undefined;
  const emailError = touched.email && !isValidEmail(email) ? "Enter a valid email address." : undefined;
  const passwordError = touched.password && password.length < 8 ? "Use 8+ characters with a number." : undefined;
  const confirmError =
    touched.confirm && confirm !== password ? "Passwords do not match." : undefined;

  const passwordSuccess = touched.password && password.length >= 10 ? "Great strength." : undefined;

  const apiBase = getApiBase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const hasErrors = !name.trim() || !isValidEmail(email) || password.length < 8 || confirm !== password;
    if (hasErrors) {
      setTouched({ name: true, email: true, password: true, confirm: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = "/auth/register/student";
      const requestInit: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      };

      let response: Response;
      try {
        response = await fetch(`${apiBase}${endpoint}`, requestInit);
      } catch (networkError) {
        const fallbackBase = getDirectLocalApiBase();
        if (!fallbackBase || fallbackBase === apiBase) {
          throw networkError;
        }

        response = await fetch(`${fallbackBase}${endpoint}`, requestInit);
      }

      const data = await readResponsePayload(response);
      if (!response.ok) {
        throw new Error(data?.message || "Registration failed. Please check if backend API is running.");
      }

      setSubmitSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.hash = "#/login";
      }, 1500);
    } catch (error) {
      if (error instanceof Error && /failed to fetch/i.test(error.message)) {
        setSubmitError("Unable to reach server. Make sure backend is running on port 5000, then try again.");
      } else {
        setSubmitError(error instanceof Error ? error.message : "Registration failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Student Registration"
      subtitle="Create your student account to connect with alumni mentors."
      footer={
        <div style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>
          <p>
            Already a member?{" "}
            <a 
              href="#/login" 
              style={{ 
                color: "#c4b5fd", 
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ddd6fe"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#c4b5fd"}
            >
              Sign in
            </a>
          </p>
          <p style={{ marginTop: "8px", color: "#64748b", fontSize: "11px" }}>
            <GraduationCap size={12} style={{ display: "inline", marginRight: "4px" }} />
            Alumni accounts are created by administrators only.
          </p>
        </div>
      }
    >
      <form style={{ display: "flex", flexDirection: "column", gap: "20px" }} onSubmit={handleSubmit}>
        <AuthField
          id="register-name"
          label="Full name"
          value={name}
          onChange={setName}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          error={nameError}
          helperText={!nameError ? "Use your name as shown on student records." : undefined}
          autoComplete="name"
          required
        />

        <AuthField
          id="register-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={emailError}
          helperText={!emailError ? "We will send a verification link." : undefined}
          autoComplete="email"
          required
        />

        <AuthField
          id="register-password"
          label="Password"
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
          id="register-confirm"
          label="Confirm password"
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
          whileHover={{ 
            scale: 1.02, 
            boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Creating account..." : "Create Student Account"}
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
};

export default RegisterPage;
