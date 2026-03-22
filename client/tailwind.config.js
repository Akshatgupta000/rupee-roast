/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        background: '#ffffff', // Bright white for Light Mode
        surface: '#f8f8f8',
        'wrapped-black': '#121212',
        'wrapped-lime': '#ccff00',
        'wrapped-pink': '#ff0099',
        'wrapped-cyan': '#00ffff',
        'wrapped-yellow': '#ffcc00',
        'wrapped-white': '#ffffff',
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px rgba(0,0,0,1)', // Hard black shadow
        'hard-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
        'hard-white': '4px 4px 0px 0px rgba(255,255,255,1)',
        'hard-lime': '4px 4px 0px 0px #ccff00',
        'hard-pink': '4px 4px 0px 0px #ff0099',
      },
      keyframes: {
        wobble: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        wobble: 'wobble 2s ease-in-out infinite',
        pop: 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      }
    },
  },
  plugins: [],
}
