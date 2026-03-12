/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#38bdf8',
          700: '#0ea5e9',
          accent: '#6366f1'
        }
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          '2xl': '1280px'
        }
      },
      boxShadow: {
        'soft': '0 6px 24px rgba(0,0,0,0.06)'
      },
      borderRadius: {
        '2xl': '1rem'
      },
      animation: {
        'slideDown': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { 
            transform: 'translateY(-100%)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          },
        }
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        hellokorea: {
          "primary": "#38bdf8",
          "primary-focus": "#0ea5e9",
          "secondary": "#6366f1",
          "accent": "#60a5fa",
          "neutral": "#111827",
          "base-100": "#fafaf9"
        }
      }
    ],
  },
};






