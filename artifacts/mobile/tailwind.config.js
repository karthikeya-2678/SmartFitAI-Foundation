/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#22C55E',
        'primary-fg': '#0F172A',
        accent: '#06B6D4',
        bg: '#0F172A',
        surface: '#1E293B',
        card: '#334155',
        border: '#334155',
        'text-secondary': '#CBD5E1',
        muted: '#94A3B8',
        destructive: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        regular: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
