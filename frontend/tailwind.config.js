/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        league: ['League Gothic', 'sans-serif'],
      },
      colors: {
        'brand': {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#dde5fd',
          300: '#c4d1fb',
          400: '#9ab3f8',
          500: '#6d8ef4',
          600: '#3d64ed',
          700: '#1d44db',
          800: '#1937b6',
          900: '#162d91',
        },
      },
    },
  },
  plugins: [],
};