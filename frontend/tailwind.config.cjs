/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f8c4cb',
          300: '#f39ca8',
          400: '#ea6a7c',
          500: '#e1405a',
          600: '#ca2545',
          700: '#a81e39',
          800: '#8c1b33',
          900: '#771a30',
          950: '#420a18',
        },
        midnight: {
          50: '#f6f6f7',
          100: '#e0e2e6',
          200: '#c2c6cd',
          300: '#9ca2ae',
          400: '#787e8c',
          500: '#5d6373',
          600: '#4a4f5d',
          700: '#3e424d',
          800: '#333740',
          900: '#1f2127',
          950: '#121318',
        },
      },
    },
  },
  plugins: [],
};