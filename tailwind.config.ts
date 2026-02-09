import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // FanNu custom colors
        fannu: {
          purple: "hsl(var(--fannu-purple))",
          "purple-hover": "hsl(var(--fannu-purple-hover))",
          pink: "hsl(var(--fannu-pink))",
          teal: "hsl(var(--fannu-teal))",
          gold: "hsl(var(--fannu-gold))",
          blue: "hsl(var(--fannu-blue))",
        },
        // Status colors
        success: {
          DEFAULT: "hsl(var(--success))",
          soft: "hsl(var(--success-soft))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          soft: "hsl(var(--warning-soft))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          soft: "hsl(var(--error-soft))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          soft: "hsl(var(--info-soft))",
        },
        // Surface colors
        surface: {
          page: "hsl(var(--surface-page))",
          card: "hsl(var(--surface-card))",
          elevated: "hsl(var(--surface-elevated))",
          overlay: "hsl(var(--surface-overlay))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-dm-sans)", "var(--font-inter)", "system-ui", "sans-serif"],
        ethiopic: ["Noto Sans Ethiopic", "system-ui", "sans-serif"],
      },
      fontSize: {
        // FanNu typography scale
        "display-lg": ["2.125rem", { lineHeight: "1.2", fontWeight: "800" }],
        "display": ["1.75rem", { lineHeight: "1.25", fontWeight: "800" }],
        "title-1": ["1.25rem", { lineHeight: "1.3", fontWeight: "700" }],
        "title-2": ["1.0625rem", { lineHeight: "1.4", fontWeight: "700" }],
        "headline": ["1rem", { lineHeight: "1.5", fontWeight: "600" }],
        "body": ["0.9375rem", { lineHeight: "1.6", fontWeight: "400" }],
        "callout": ["0.875rem", { lineHeight: "1.5", fontWeight: "600" }],
        "subhead": ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["0.75rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0)",
        "safe-top": "env(safe-area-inset-top, 0)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(90deg, hsl(262 83% 58%) 0%, hsl(330 81% 60%) 100%)",
        "gradient-accent": "linear-gradient(135deg, hsl(262 83% 58%) 0%, hsl(330 81% 60%) 50%, hsl(217 91% 60%) 100%)",
        "gradient-gold": "linear-gradient(90deg, hsl(43 96% 56%) 0%, hsl(28 95% 55%) 100%)",
        "gradient-success": "linear-gradient(90deg, hsl(160 84% 39%) 0%, hsl(217 91% 60%) 100%)",
        "gradient-fade-bottom": "linear-gradient(180deg, transparent 0%, hsl(230 33% 6%) 100%)",
      },
      boxShadow: {
        "glow-purple": "0 0 40px hsl(262 83% 58% / 0.3)",
        "glow-pink": "0 0 40px hsl(330 81% 60% / 0.3)",
        "card": "0 4px 24px hsl(0 0% 0% / 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
