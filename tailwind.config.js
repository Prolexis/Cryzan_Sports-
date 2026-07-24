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
          dark: 'var(--brand-dark)',
          card: 'var(--brand-card)',
          lightBg: 'var(--brand-lightBg)',
          text: 'var(--brand-text)',
          muted: 'var(--brand-muted)',
          border: 'var(--brand-border)'
        }
      }
    },
  },
  plugins: [],
}
