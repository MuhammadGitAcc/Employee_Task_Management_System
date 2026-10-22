import forms from "@tailwindcss/forms";
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
      },
      fontFamily: {
        sans: ["Inter Variable", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [forms],
};
