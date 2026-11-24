/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lagoon: {
          50: '#effcfc', 100: '#d1f5f5', 200: '#98e7e9', 300: '#64dbe0',
          400: '#34c9d5', 500: '#087c89', 600: '#066d7c', 700: '#07596a',
          800: '#104656', 900: '#103744', 950: '#082832',
        },
      },
    },
  },
  plugins: [],
};
