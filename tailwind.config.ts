import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        "bg-3": "var(--bg-3)",
        "bg-hover": "var(--bg-hover)",
        border: "var(--border)",
        "border-2": "var(--border-2)",
        text: "var(--text)",
        "text-2": "var(--text-2)",
        "text-3": "var(--text-3)",
        accent: "var(--accent)",
        "accent-h": "var(--accent-h)",
        "accent-dim": "var(--accent-dim)",
        "accent-glow": "var(--accent-glow)",
        success: "var(--success)",
        "success-dim": "var(--success-dim)",
        warn: "var(--warn)",
        "warn-dim": "var(--warn-dim)",
        danger: "var(--danger)",
        "danger-dim": "var(--danger-dim)",
      },
      fontFamily: {
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,.5), 0 4px 16px rgba(0,0,0,.3)",
        "card-md": "0 2px 8px rgba(0,0,0,.6), 0 8px 24px rgba(0,0,0,.35)",
        "card-light": "0 1px 3px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.04)",
        "card-light-md": "0 2px 8px rgba(0,0,0,.09), 0 8px 24px rgba(0,0,0,.06)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        fadeUp: "fadeUp .3s ease both",
        spin: "spin .7s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
