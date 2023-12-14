/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontSize: {
      sm: '0.8rem',
      base: '1rem',
      xl: '1.25rem',
      '2xl': '1.563rem',
      '3xl': '1.953rem',
      '4xl': '2.441rem',
      '5xl': '3.052rem',
    },
    extend: {
      colors: {
        'black-transparent': 'rgba(75, 81, 74, 0.85)',
        'white-transparent': 'rgba(255, 255, 255, 0.8)',
        'text-light': '#eeeeee',
        'text-dark': '#666666',
        'background': '#eeeeee',
        'primary': '#90b493',
        'secondary': '#728370',
        'accent': '#4b514a',
      },
    },
    backdropFilter: {
      'none': 'none',
      'blur': 'blur(20px)',
    },
  },
  plugins: [],
}

