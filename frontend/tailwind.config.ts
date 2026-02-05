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
        brand: {
          black: "#000000",
          neon: "#1AFF00",
          gray: "#B0B0B0",
          darkgray: "#111111",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      boxShadow: {
        glow: "0 0 10px rgba(26, 255, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
