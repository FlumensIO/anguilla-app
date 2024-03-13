// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const colors = require('tailwindcss/colors');
const flumensTailwind = require('@flumens/tailwind/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    'node_modules/@flumens/tailwind/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          // https://www.tailwindshades.com/#color=0%2C0%2C15.294117647058824&step-up=15&step-down=3&hue-shift=0&name=mine-shaft&base-stop=6&v=1&overrides=e30%3D
          DEFAULT: '#272727',
          50: '#F9F9F9',
          100: '#E6E6E6',
          200: '#C0C0C0',
          300: '#9A9A9A',
          400: '#747474',
          500: '#4D4D4D',
          600: '#272727',
          700: '#1F1F1F',
          800: '#181818',
          900: '#101010',
          950: '#0C0C0C',
        },

        secondary: {
          // https://www.tailwindshades.com/#color=37.02127659574467%2C100%2C53.92156862745098&step-up=9&step-down=11&hue-shift=0&name=sun&base-stop=5&v=1&overrides=e30%3D
          DEFAULT: '#FFA514',
          50: '#FFF4E3',
          100: '#FFEBCC',
          200: '#FFDA9E',
          300: '#FFC870',
          400: '#FFB742',
          500: '#FFA514',
          600: '#DB8700',
          700: '#A36400',
          800: '#6B4200',
          900: '#331F00',
          950: '#170E00',
        },

        tertiary: colors.sky,

        success: {
          // https://www.tailwindshades.com/#color=128.25396825396825%2C100%2C32&step-up=8&step-down=11&hue-shift=0&name=fun-green&base-stop=7&v=1&overrides=e30%3D
          DEFAULT: '#00A316',
          50: '#ADFFB9',
          100: '#99FFA7',
          200: '#70FF84',
          300: '#47FF61',
          400: '#1FFF3D',
          500: '#00F522',
          600: '#00CC1C',
          700: '#00A316',
          800: '#006B0F',
          900: '#003307',
          950: '#001703',
        },

        warning: {
          // https://www.tailwindshades.com/#color=48.48214285714286%2C100%2C43.92156862745098&step-up=8&step-down=11&hue-shift=0&name=corn&base-stop=6&v=1&overrides=e30%3D
          DEFAULT: '#E0B500',
          50: '#FFF3C1',
          100: '#FFEFAD',
          200: '#FFE784',
          300: '#FFE05B',
          400: '#FFD833',
          500: '#FFD00A',
          600: '#E0B500',
          700: '#A88800',
          800: '#705A00',
          900: '#382D00',
          950: '#1C1600',
        },

        danger: {
          // https://www.tailwindshades.com/#color=0%2C85.36585365853658%2C59.80392156862745&step-up=8&step-down=11&hue-shift=0&name=flamingo&base-stop=5&v=1&overrides=e30%3D
          DEFAULT: '#F04141',
          50: '#FDEBEB',
          100: '#FCD8D8',
          200: '#F9B2B2',
          300: '#F68D8D',
          400: '#F36767',
          500: '#F04141',
          600: '#E71212',
          700: '#B30E0E',
          800: '#7F0A0A',
          900: '#4B0606',
          950: '#310404',
        },
      },
    },
  },
  plugins: flumensTailwind.plugins,
};
