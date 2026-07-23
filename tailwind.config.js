/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0E0C",
        panel: "#101512",
        line: "#1E2622",
        ink: "#E4EFE8",
        subtle: "#7C8B82",
        green: "#00D68F",
        greenDark: "#00A86F",
        red: "#FF5C5C",
        amber: "#FFB020",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(0,0,0,0.3)",
      },
    },
  },
  plugins: [],
};
