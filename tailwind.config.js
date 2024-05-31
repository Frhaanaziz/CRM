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
          50: '#E1EEFF',
          100: '#C7E0FE',
          200: '#8BBFFE',
          300: '#53A0FD',
          400: '#1C81FD',
          500: '#0265DC', // primary
          600: '#0250B1',
          700: '#013C83',
          800: '#012756',
          900: '#00152D',
          950: '#000914',
        },
        secondary: {
          50: '#FEFBF1',
          100: '#FDF7DD',
          200: '#FBF0C0',
          300: '#FAE79E',
          400: '#F8E081',
          500: '#F6D860', // secondary
          600: '#F2C921',
          700: '#C19D0B',
          800: '#826A07',
          900: '#3F3304',
          950: '#221B02',
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
