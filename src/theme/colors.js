// Fixed "Dusk" neutrals. Shared by tailwind.config.js and by components that need
// raw values (SVG artwork), so it stays plain CommonJS.
//
// Brand colours (header, accent, highlight) are NOT here: they change with the
// student's university. See src/theme/universities.ts and ThemeProvider.tsx.
module.exports = {
  ink: '#060118',
  night: '#1a0041',
  mint: {
    DEFAULT: '#2ED3B7',
    deep: '#0E5E58',
    wash: '#E0F5F3',
    line: '#86DCD2',
    skirt: '#5FC6B4',
  },
  surface: '#ffffff',
  /** Page background behind white cards. */
  canvas: '#F6F4FA',
  line: '#ECE8F4',
  muted: '#6B6485',
  cream: '#FDFCF6',
  danger: '#B42318',
};
