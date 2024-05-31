/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfaff',
          100: '#d4f2ff',
          200: '#b3ebff',
          300: '#7ee0ff',
          400: '#42ccff',
          500: '#17acff',
          600: '#008dff',
          700: '#0074fc',
          800: '#0265dc', // primary
          900: '#09519f',
          950: '#0b3260',
        },
        secondary: {
          50: '#fefcec',
          100: '#fcf4c9',
          200: '#f9e78e',
          300: '#f6d860', // secondary
          400: '#f3c22c',
          500: '#eca314',
          600: '#d17d0e',
          700: '#ad5910',
          800: '#8d4513',
          900: '#743913',
          950: '#421d06',
        },
        base: {
          100: '#ffffff',
          200: '#F6F7F8',
          300: '#E1E3E6',
        },
      },
    },
  },
};
