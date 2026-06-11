const typography = require("@tailwindcss/typography");

/**
 * Neumorphism design system (TypeUI). One stone-gray material: elements emerge
 * from the surface via paired soft shadows (raised) or inverted shadows (inset),
 * never borders or contrasting fills. Deep-teal accents, Space Mono type.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#E7E5E4", // warm stone-gray — the single base material
        ink: "#1E2938", // navy-charcoal text
        teal: { DEFAULT: "#006666", deep: "#004D4D" }, // primary accent
        secondary: "#F1F2F5",
        success: "#00A63D",
        warn: "#FE9900",
        danger: "#FF2157",
      },
      fontFamily: {
        sans: ["var(--font-space-mono)", "ui-monospace", "monospace"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        // Top-left light source: light highlight top-left, dark shadow bottom-right.
        neu: "6px 6px 12px #c7c5c4, -6px -6px 12px #ffffff",
        "neu-sm": "4px 4px 8px #cbc9c8, -4px -4px 8px #ffffff",
        "neu-inset": "inset 4px 4px 8px #c7c5c4, inset -4px -4px 8px #ffffff",
        "neu-pressed": "inset 5px 5px 10px #c1bfbe, inset -5px -5px 10px #ffffff",
      },
    },
  },
  plugins: [typography],
};
