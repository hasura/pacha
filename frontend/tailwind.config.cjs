const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

function rgbToHsl(hex) {
  // Remove the '#' character from the beginning of the hex code
  hex = hex.replace('#', '');

  // Convert hex code to RGB
  const red = parseInt(hex.substring(0, 2), 16) / 255;
  const green = parseInt(hex.substring(2, 4), 16) / 255;
  const blue = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue,
    saturation,
    lightness = (max + min) / 2;

  if (max == min) {
    hue = saturation = 0; // achromatic
  } else {
    const delta = max - min;
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      case blue:
        hue = (red - green) / delta + 4;
        break;
    }
    hue *= 60;
  }

  return `${parseFloat(hue.toFixed(2))}, ${parseFloat(
    (100 * saturation).toFixed(2)
  )}%, ${parseFloat((100 * lightness).toFixed(2))}%`;
}

module.exports = {
  content: [
    './index.html',
    './app/**/*.{js,ts,jsx,tsx}',
    './packages/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: [
        'Inter, ui-sans-serif,  system-ui',
        {
          fontFeatureSettings: '"ss01", "ss03", "zero", "case", "calt"',
        },
      ],
      mono: ['JetBrainsMono', 'ui-monospace', 'monospace'],
    },
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        primary: colors.blue,
        secondary: colors.slate,
        muted: colors.slate[600],
      },
      spacing: {
        xs: '0.571rem', // ~9.5 px
        sm: '0.857rem', // ~14 px
        md: '1.429rem', // ~23 px
        lg: '2.286rem', // 36.5px
        xl: '2.857rem', // 45.7px
        '2xl': '7.57rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      screens: {
        // Desktop-first display classes
        '-2xl': { max: '1536px' },
        '-xl': { max: '1280px' },
        '-lg': { max: '1024px' },
        '-md': { max: '768px' },
        '-sm': { max: '640px' },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-radix')(),
    plugin(function ({ addBase, theme }) {
      const colors = {
        '--tw-font-family-sans': theme('fontFamily.sans'),
        '--tw-font-family-mono': theme('fontFamily.mono'),
        '--tw-color-white-hex': '#ffffff',
        '--tw-color-white-hsl': '0, 0%, 100%',
        '--tw-color-black-hex': '#000000',
        '--tw-color-black-hsl': '0, 0%, 0%',
      };
      Object.entries(theme('colors'))
        .filter(([name]) => !['white', 'black'].includes(name))
        .forEach(([name, color]) => {
          Object.entries(color).forEach(([shade, value]) => {
            if (typeof value === 'object') {
              Object.entries(value).forEach(([shade, hex]) => {
                if (hex?.startsWith('#')) {
                  colors[`--tw-color-${name}-${shade}-hex`] = hex;
                  colors[`--tw-color-${name}-${shade}-hsl`] = rgbToHsl(hex);
                }
              });
            } else if (typeof value === 'string' && value?.startsWith('#')) {
              colors[`--tw-color-${name}-${shade}-hex`] = value;
              colors[`--tw-color-${name}-${shade}-hsl`] = rgbToHsl(value);
            }
          });
        });
      addBase({
        '*, ::before, ::after': colors,
      });
    }),
  ],
};