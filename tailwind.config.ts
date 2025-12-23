import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // African-inspired color palette
        primary: {
          50: "#fef9e7",
          100: "#fdf0c3",
          200: "#fbe38a",
          300: "#f8d14d",
          400: "#f5c518",
          500: "#e6a700", // Gold - main primary
          600: "#c78500",
          700: "#9f6200",
          800: "#824d08",
          900: "#6e400d",
          950: "#402102",
        },
        secondary: {
          50: "#ecfdf3",
          100: "#d1fae1",
          200: "#a7f3c9",
          300: "#6ee7a7",
          400: "#34d37d",
          500: "#10b959", // Green
          600: "#059642",
          700: "#047837",
          800: "#065f2e",
          900: "#064e27",
          950: "#022c14",
        },
        accent: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444", // Red
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        dark: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#262626", // Dark background
          950: "#171717",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        "gradient": "gradient 8s ease infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "from": { boxShadow: "0 0 10px #f5c518, 0 0 20px #f5c518, 0 0 30px #f5c518" },
          "to": { boxShadow: "0 0 20px #e6a700, 0 0 30px #e6a700, 0 0 40px #e6a700" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-pattern": "url('/patterns/african-pattern.svg')",
      },
      boxShadow: {
        "glow": "0 0 15px rgba(245, 197, 24, 0.5)",
        "glow-lg": "0 0 30px rgba(245, 197, 24, 0.6)",
        "inner-glow": "inset 0 0 20px rgba(245, 197, 24, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
