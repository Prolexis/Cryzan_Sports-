/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#d32f2f',
          redHover: '#b71c1c',
          dark: '#121212',
          card: '#1e1e1e',
          lightBg: '#f8f9fa'
        }
      }
    },
  },
  plugins: [],
}
