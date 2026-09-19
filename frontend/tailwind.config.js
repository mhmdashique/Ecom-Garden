/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { outfit: ['Outfit','sans-serif'], fraunces: ['Fraunces','serif'] },
      colors: {
        forest: '#0a2e1f',
        sage: '#e8f0e3',
        cream: '#fdfbf7',
        amber: { 400: '#facc15' },
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-33.333%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: { marquee: 'marquee 18s linear infinite', float: 'float 5s ease-in-out infinite' },
      borderRadius: { '4xl': '2rem' },
      boxShadow: { soft: '0 8px 30px rgba(0,0,0,0.06)', card: '0 20px 60px rgba(10,46,31,0.08)' },
    },
  },
  plugins: [],
}
