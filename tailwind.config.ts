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
      },
      animation: {
        'slide-in-right': 'slide-in-right 200ms ease-out',
        'fade-in': 'fade-in 150ms ease-out',
        'slide-up': 'slide-up 220ms ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
