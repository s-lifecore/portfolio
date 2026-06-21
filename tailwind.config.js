/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        jetbrains: ["var(--font-jetbrains-mono)", "monospace"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
        pacifico: ["var(--font-pacifico)", "cursive"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};