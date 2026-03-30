import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-share-tech)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "led-on":
          "0 0 12px rgba(34, 197, 94, 0.85), 0 0 24px rgba(34, 197, 94, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
        "led-dim": "inset 0 2px 6px rgba(0,0,0,0.65)",
        "panel": "0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
