/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./apps/frontend/**/*.{js,jsx,ts,tsx}",
    "./apps/frontend/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'bg-menu': '#1a1a1a',
        'bg-term': '#111111',
        'bg-gray-dark': '#23272e',
      },
    },
  },
  plugins: [],
};
