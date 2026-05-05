import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void:    "#03030a",
        base:    "#070710",
        card:    "#0b0b1a",
        panel:   "#0f0f22",
        hover:   "#13132a",
        border:  "#181830",
        border2: "#232348",
        green:   { DEFAULT: "#00e87a", bright: "#00ff88" },
        red:     { DEFAULT: "#ff2d55" },
        blue:    { DEFAULT: "#3b9eff" },
        amber:   { DEFAULT: "#ffb800" },
        purple:  { DEFAULT: "#a855f7" },
        cyan:    { DEFAULT: "#06b6d4" },
        txt:     { DEFAULT: "#e0e0f4", muted: "#6868a0", faint: "#282850" },
      },
      fontFamily: {
        sans:  ["Chakra Petch", "monospace"],
        mono:  ["JetBrains Mono", "monospace"],
      },
      animation: {
        fadeIn:   "fadeIn 0.18s ease forwards",
        aiPulse:  "aiPulse 0.8s ease-in-out infinite",
        xpFloat:  "xpFloat 1.5s ease forwards",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0", transform: "translateY(5px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        aiPulse: { "0%,100%": { opacity: "0.3" }, "50%": { opacity: "1" } },
        xpFloat: { "0%": { opacity: "0" }, "30%": { opacity: "1" }, "100%": { opacity: "0", transform: "translateY(-60px)" } },
      },
    },
  },
  plugins: [],
};

export default config;
