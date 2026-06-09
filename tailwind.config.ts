import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'rach-yellow': '#F9D34C',
        'rach-blue': '#0A80FE',
        'rach-red': '#E12715',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        sans: ['system-ui', 'sans-serif'],
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px #000000',
        'pixel-sm': '2px 2px 0px 0px #000000',
        'pixel-blue': '4px 4px 0px 0px #0A80FE',
        'pixel-red': '4px 4px 0px 0px #E12715',
        'pixel-white': '4px 4px 0px 0px #FFFFFF',
        'pixel-inset': 'inset 2px 2px 0px 0px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};
export default config;
