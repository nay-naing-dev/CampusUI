const colors = require('./src/theme/colors');

// Brand colours (brand, loop = Figma "Primary", highlight = Figma "Accent", third,
// soft, tint) follow the student's university. ThemeProvider sets the variables;
// global.css holds the defaults (the Figma header frame's black-plum).
const themed = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ...colors,
        brand: { DEFAULT: themed('brand'), deep: themed('brand-deep') },
        loop: themed('accent'),
        highlight: themed('highlight'),
        third: themed('third'),
        soft: themed('soft'),
        tint: themed('tint'),
      },
      fontFamily: {
        display: ['Chango_400Regular'],
        heading: ['BricolageGrotesque_800ExtraBold'],
        body: ['Figtree_400Regular'],
        'body-medium': ['Figtree_500Medium'],
        'body-semibold': ['Figtree_600SemiBold'],
        'body-bold': ['Figtree_700Bold'],
      },
    },
  },
  plugins: [],
};
