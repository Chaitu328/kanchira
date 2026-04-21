/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#640101',
          darkred: '#810202',
          gold: '#D2AE4E',
          brown: '#975607',
          yellow: '#DAA511',
          green: '#376D5C',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica Neue', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
