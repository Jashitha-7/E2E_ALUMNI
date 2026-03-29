/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════
      // COLOR PALETTE - Premium SaaS inspired by Linear/Vercel/Apple
      // ═══════════════════════════════════════════════════════════════
      colors: {
        // Brand Colors - Deep Purple/Indigo gradient family
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        // Accent - Cyan/Teal for highlights
        accent: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        // Success - Emerald
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        // Warning - Amber
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Error - Rose
        error: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        // Neutral - Slate based with subtle warmth
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        // Surface colors for glassmorphism
        surface: {
          light: "rgba(255, 255, 255, 0.7)",
          "light-elevated": "rgba(255, 255, 255, 0.85)",
          dark: "rgba(15, 23, 42, 0.7)",
          "dark-elevated": "rgba(15, 23, 42, 0.85)",
        },
        // Glass overlay colors
        glass: {
          white: "rgba(255, 255, 255, 0.1)",
          "white-strong": "rgba(255, 255, 255, 0.2)",
          dark: "rgba(0, 0, 0, 0.1)",
          "dark-strong": "rgba(0, 0, 0, 0.2)",
        },
      },

      // ═══════════════════════════════════════════════════════════════
      // TYPOGRAPHY SCALE - Modern, clean, Apple-inspired
      // ═══════════════════════════════════════════════════════════════
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Cal Sans",
          "Inter",
          "SF Pro Display",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Fira Code",
          "monospace",
        ],
      },
      fontSize: {
        // Display sizes for hero sections
        "display-2xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-xl": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-md": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "600" }],
        "display-sm": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        // Body sizes
        "body-xl": ["1.25rem", { lineHeight: "1.75", fontWeight: "400" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75", fontWeight: "400" }],
        "body-md": ["1rem", { lineHeight: "1.625", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-xs": ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
        // Label sizes
        "label-lg": ["0.875rem", { lineHeight: "1.25", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-md": ["0.8125rem", { lineHeight: "1.25", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-sm": ["0.75rem", { lineHeight: "1.25", letterSpacing: "0.02em", fontWeight: "500" }],
      },

      // ═══════════════════════════════════════════════════════════════
      // SPACING SYSTEM - 4px base unit, harmonious scale
      // ═══════════════════════════════════════════════════════════════
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "6.5": "1.625rem",
        "7.5": "1.875rem",
        "8.5": "2.125rem",
        "9.5": "2.375rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "17": "4.25rem",
        "18": "4.5rem",
        "19": "4.75rem",
        "21": "5.25rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
        "42": "10.5rem",
        "50": "12.5rem",
        "58": "14.5rem",
        "66": "16.5rem",
        "74": "18.5rem",
        "82": "20.5rem",
        "90": "22.5rem",
        "100": "25rem",
        "120": "30rem",
      },

      // ═══════════════════════════════════════════════════════════════
      // BORDER RADIUS - Soft, modern corners
      // ═══════════════════════════════════════════════════════════════
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },

      // ═══════════════════════════════════════════════════════════════
      // BOX SHADOWS - Layered, soft, 3D depth
      // ═══════════════════════════════════════════════════════════════
      boxShadow: {
        // Subtle shadows
        "soft-xs": "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "soft-sm": "0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        "soft-md": "0 4px 8px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.03)",
        "soft-lg": "0 12px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.03)",
        "soft-xl": "0 20px 40px -8px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.04)",
        "soft-2xl": "0 32px 64px -12px rgba(0, 0, 0, 0.14), 0 12px 24px -4px rgba(0, 0, 0, 0.05)",
        // Glow shadows for interactive elements
        "glow-brand": "0 0 20px -5px rgba(139, 92, 246, 0.4)",
        "glow-brand-lg": "0 0 40px -10px rgba(139, 92, 246, 0.5)",
        "glow-accent": "0 0 20px -5px rgba(6, 182, 212, 0.4)",
        "glow-success": "0 0 20px -5px rgba(16, 185, 129, 0.4)",
        "glow-error": "0 0 20px -5px rgba(244, 63, 94, 0.4)",
        // Glass shadows
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
        "glass-lg": "0 16px 48px 0 rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.15)",
        // Inner shadows for depth
        "inner-soft": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
      },

      // ═══════════════════════════════════════════════════════════════
      // BACKDROP BLUR - Glassmorphism
      // ═══════════════════════════════════════════════════════════════
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },

      // ═══════════════════════════════════════════════════════════════
      // ANIMATIONS - Smooth, professional motion
      // ═══════════════════════════════════════════════════════════════
      animation: {
        // Entrance animations
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "fade-in-down": "fadeInDown 0.5s ease-out forwards",
        "fade-in-left": "fadeInLeft 0.5s ease-out forwards",
        "fade-in-right": "fadeInRight 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "slide-in-up": "slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-down": "slideInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        // Interactive animations
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-soft": "bounceSoft 1s ease-in-out infinite",
        // Gradient animations
        "gradient-shift": "gradientShift 8s ease infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInLeft: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideInDown: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px -5px rgba(139, 92, 246, 0.4)" },
          "50%": { boxShadow: "0 0 30px -5px rgba(139, 92, 246, 0.6)" },
        },
      },

      // ═══════════════════════════════════════════════════════════════
      // TRANSITION TIMING FUNCTIONS - Smooth, natural easing
      // ═══════════════════════════════════════════════════════════════
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "smooth-in": "cubic-bezier(0.4, 0, 1, 1)",
        "smooth-out": "cubic-bezier(0, 0, 0.2, 1)",
        "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "spring": "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      // ═══════════════════════════════════════════════════════════════
      // Z-INDEX SCALE - Organized layering
      // ═══════════════════════════════════════════════════════════════
      zIndex: {
        "dropdown": "1000",
        "sticky": "1100",
        "modal-backdrop": "1200",
        "modal": "1300",
        "popover": "1400",
        "tooltip": "1500",
        "toast": "1600",
      },

      // ═══════════════════════════════════════════════════════════════
      // BACKGROUND IMAGES - Gradients and patterns
      // ═══════════════════════════════════════════════════════════════
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
        "gradient-brand-vertical": "linear-gradient(180deg, #8b5cf6 0%, #06b6d4 100%)",
        "gradient-dark": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        "gradient-glass": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "gradient-mesh": `
          radial-gradient(at 40% 20%, rgba(139, 92, 246, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(6, 182, 212, 0.2) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(139, 92, 246, 0.2) 0px, transparent 50%),
          radial-gradient(at 80% 50%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%)
        `,
        "noise": "url('/noise.png')",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};
