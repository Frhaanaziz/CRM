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
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    logs: false,
    themes: [
      {
        pipeline: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#0265DC',
          //   secondary: '#f6d860',
          accent: '#5258E4',
          neutral: '#1F2122',
          success: '#007A4D',
          error: '#D31510',
          'base-100': '#ffffff',
          'base-200': '#F6F7F8',
          'base-300': '#E1E3E6',
          //   '--rounded-box': '1rem', // border radius rounded-box utility class, used in card and other large boxes
          //   '--rounded-btn': '0.5rem', // border radius rounded-btn utility class, used in buttons and similar element
          //   '--rounded-badge': '1.9rem', // border radius rounded-badge utility class, used in badges and similar
          //   '--border-btn': '1px', // border width of buttons
          //   '--tab-border': '1px', // border width of tabs
          //   '--tab-radius': '0.5rem', // border radius of tabs
        },
      },
    ],
  },
};
