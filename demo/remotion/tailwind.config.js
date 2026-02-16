/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          100: '#0a0a0a',
          200: '#171717'
        },
        gray: {
          100: '#ededed',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0a0a0a',
          1000: '#000000'
        },
        blue: {
          600: '#2563eb',
          700: '#0070F3'
        },
        green: {
          700: '#46A758'
        },
        amber: {
          700: '#FFB224'
        },
        red: {
          700: '#E5484D'
        }
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace']
      }
    }
  },
  plugins: []
};
