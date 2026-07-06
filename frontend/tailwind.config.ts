import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#c8102e",
          "red-dark": "#8f0c21",
          black: "#0a0a0a",
          charcoal: "#1a1a1a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
