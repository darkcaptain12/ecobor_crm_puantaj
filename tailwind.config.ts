import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "eco-green": "#2E7D32",
        "eco-green-lt": "#4CAF50",
        "eco-green-dk": "#1B5E20",
        "eco-green-bg": "#E8F5E9",
        "eco-bg": "#F5F7F5",
        "eco-surface": "#FFFFFF",
        "eco-border": "#E0E7E0",
        "eco-text": "#1A2E1A",
        "eco-text-2": "#4A6B4A",
        "eco-gray": "#78909C",
        "eco-gray-lt": "#B0BEC5",
        "eco-success": "#43A047",
        "eco-warning": "#FFA000",
        "eco-error": "#E53935",
        "eco-info": "#1976D2",
        "eco-admin": "#1A2E1A",
        "eco-admin-2": "#243B24",
        "eco-admin-border": "#3A5A3A",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12)",
        soft: "0 2px 8px rgba(46,125,50,0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
