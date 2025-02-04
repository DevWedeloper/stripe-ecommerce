/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@spartan-ng/brain/hlm-tailwind-preset')],
  content: [
    './index.html',
    './src/**/*.{html,ts,md}',
    './libs/ui/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-in-out',
        'slide-in-from-left': 'slide-in-from-left 500ms ease-in-out',
        'slide-in-from-right': 'slide-in-from-right 500ms ease-in-out',
      },
    },
  },
  plugins: [],
};
