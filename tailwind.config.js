const lineClamp = require('@tailwindcss/line-clamp');
const typography = require('@tailwindcss/typography');
const forms = require('@tailwindcss/forms');
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  enabled: true,
  darkMode: 'class',
  variants: {},
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#202225',
          800: '#2f3136',
          700: '#36393f',
          600: '#4f545c',
          400: '#d4d7dc',
          300: '#e3e5e8',
          200: '#ebedef',
          100: '#f2f3f5'
        }
      },
      spacing: {
        88: '22rem'
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans]
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          lg: '1124px',
          xl: '1124px',
          '2xl': '1124px'
        }
      }
    }
  },
  plugins: [forms, typography, lineClamp]
};
