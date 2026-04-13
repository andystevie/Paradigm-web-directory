/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'phh-purple': '#5B2C8B',
        'phh-purple-deep': '#3A1B5C',
        'phh-purple-light': '#7B4CA8',
        'phh-gold': '#D4A843',
        'phh-gold-light': '#E0BE6A',
        'phh-lavender': '#F5F0FA',
        'phh-gray': '#2D3748',
        'phh-gray-light': '#4A5568',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-phh': 'linear-gradient(135deg, #3A1B5C 0%, #5B2C8B 50%, #7B4CA8 100%)',
      },
    },
  },
  plugins: [],
}
