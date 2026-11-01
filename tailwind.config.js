/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        panel: '#101c2c',
        mint: '#65e6b0',
        violet: '#9b8cff'
      },
      boxShadow: { glow: '0 0 40px rgba(101,230,176,.12)' }
    }
  },
  plugins: []
}
