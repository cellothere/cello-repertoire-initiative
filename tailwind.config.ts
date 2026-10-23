import type { Config } from "tailwindcss";

const config: Config = {
  future: {
    // Hover styles only on devices that can hover, so they don't stick after a tap on phones.
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#623d88',
          teal: '#36c190',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to bottom right, #623d88, #36c190)',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'heart-pop': {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.4)' },
          '55%': { transform: 'scale(0.88)' },
          '80%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        // A long, soft deceleration: quick to respond, gentle to settle.
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'slide-in-right': 'slide-in-right 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-out-right': 'slide-out-right 220ms cubic-bezier(0.4, 0, 1, 1) forwards',
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 220ms ease-in forwards',
        'slide-up': 'slide-up 380ms cubic-bezier(0.16, 1, 0.3, 1)',
        'heart-pop': 'heart-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
