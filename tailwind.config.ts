import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'card-lg': '853px', // Custom breakpoint for music card text sizing
      },
      backgroundImage: theme => ({
        'gradient-to-br': 'linear-gradient(to bottom right, #623d88, #36c190)',
        'gradient-text': 'linear-gradient(to bottom right, #623d88, #36c190)',
      }),
      colors: {
        purple: {
          '500': '#623d88', //custom shade of purple
        },
      },
    },
  },
  plugins: [],
};
export default config;
