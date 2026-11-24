/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: { DEFAULT: "#7a1226", dark: "#5a0d1c", light: "#9a2238" },
        royal: "#a81e2e",
        gold: { DEFAULT: "#b8860b", light: "#d4af37", pale: "#e8c877" },
        ivory: "#fbf3e4",
        emerald2: "#0d6b63",
        blush: "#e07a9a",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 6px 24px -8px rgba(90, 13, 28, 0.25)",
      },
    },
  },
  plugins: [],
};
