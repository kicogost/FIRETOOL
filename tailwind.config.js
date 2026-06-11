const typography = require("@tailwindcss/typography");

/**
 * Bento design system (TypeUI). Warm over sterile: cream surfaces, peach primary,
 * steel-blue secondary, green for positive. Grid of self-contained tiles.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#FFF5E6", // cream — page + card fills
        cream: { DEFAULT: "#FFF5E6", deep: "#F6E8D4" },
        peach: { DEFAULT: "#FAD4C0", deep: "#F4B89D" }, // primary accent
        steel: { DEFAULT: "#80A1C1", deep: "#5E82A6" }, // secondary accent
        ink: "#111827", // text
        success: "#16A34A",
        warn: "#D97706",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        tile: "1.5rem", // 24px — bento tiles
      },
      boxShadow: {
        tile: "0 1px 2px rgba(17,24,39,0.04), 0 8px 24px rgba(17,24,39,0.05)",
        "tile-sm": "0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.04)",
      },
    },
  },
  plugins: [typography],
};
