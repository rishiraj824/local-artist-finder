/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'concrete-dark': '#1a1a1a',
        'concrete-mid': '#2a2a2a',
        'concrete-light': '#3a3a3a',
        'neon-green': '#39ff14',
        'neon-pink': '#ff006e',
        'neon-blue': '#00f0ff',
        'rust': '#d4622f',
        'faded-yellow': '#e8d174',
      },
    },
  },
  plugins: [],
}
