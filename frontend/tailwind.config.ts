import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff0f0',
          100: '#ffd6d6',
          200: '#ffadad',
          300: '#ff7575',
          400: '#ff3d3d',
          500: '#c41e1e',
          600: '#a01818',
          700: '#8a1212',
          800: '#6b0e0e',
          900: '#4a0a0a',
          950: '#2a0505',
        },
        gold: {
          DEFAULT: '#d4a017',
          light:   '#e8b520',
          dark:    '#b8880f',
          muted:   '#8a6510',
        },
        surface: {
          DEFAULT: '#111111',
          raised:  '#1a1a1a',
          overlay: '#222222',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: '#2a2a2a',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
