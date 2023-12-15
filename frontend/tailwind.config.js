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
        'black-transparent': 'rgba(29, 38, 72, 0.85)', // Darkened black-transparent
        'white-transparent': 'rgba(255, 255, 255, 0.8)',
        'text-light': '#405080', // Darkened text-light
        'text-dark': '#1b263d', // Darkened text-dark
        'background': '#f0f0f0', // Darkened background
        'primary': '#405080', // Darkened primary
        'secondary': '#304860', // Darkened secondary
        'tertiary': '#90A0C0', // Lightened tertiary
        'accent': '#405080', // Darkened accent
      },
    },
    backdropFilter: {
      'none': 'none',
      'blur': 'blur(20px)',
    },
  },
  plugins: [],
};
