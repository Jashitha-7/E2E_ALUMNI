"use client";

import React from "react";
import { motion } from "framer-motion";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthField from "@/components/auth/AuthField";
import { Loader2, ArrowLeft } from "lucide-react";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const ForgotPasswordPage = () => {
  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const emailError = touched && !isValidEmail(email) ? "Enter the email linked to your account." : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setTouched(true);
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <AuthLayout
      title={submitted ? "Check your inbox" : "Reset your password"}
      subtitle={submitted 
        ? `We sent a reset link to ${email}` 
        : "We will send a secure reset link to your inbox."
      }
      footer={
        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>
          <a 
            href="#/login" 
            style={{ 
              color: "#c4b5fd", 
              textDecoration: "none",
              transition: "color 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#ddd6fe"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#c4b5fd"}
          >
            <ArrowLeft size={14} />
            Back to sign in
          </a>
        </p>
      }
    >
      {!submitted ? (
        <form style={{ display: "flex", flexDirection: "column", gap: "20px" }} onSubmit={handleSubmit}>
          <AuthField
            id="forgot-email"
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => setTouched(true)}
            error={emailError}
            helperText={!emailError ? "Check spam folders if you do not see it." : undefined}
            autoComplete="email"
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
            {isSubmitting ? "Sending..." : "Send reset link"}
          </motion.button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center" }}
        >
          <div 
            style={{ 
              width: "64px", 
              height: "64px", 
              borderRadius: "50%", 
              background: "rgba(139, 92, 246, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
              <path d="M22 6c0 1-1 2-3 2H5c-2 0-3-1-3-2V4c0-1 1-2 3-2h14c2 0 3 1 3 2v2z" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={() => { setSubmitted(false); setEmail(""); setTouched(false); }}
              style={{ 
                background: "none", 
                border: "none", 
                color: "#c4b5fd", 
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              try another email
            </button>
          </p>
        </motion.div>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
