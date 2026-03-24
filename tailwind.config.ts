import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jost)'],
        display: ['var(--font-cormorant)'],
        serif: ['var(--font-playfair)', 'var(--font-lora)', 'var(--font-merriweather)'],
        heading: ['var(--font-outfit)', 'var(--font-space)', 'var(--font-syne)', 'var(--font-fraunces)', 'var(--font-cardo)', 'var(--font-cinzel)', 'var(--font-bitter)'],
      },
    },
  },
  plugins: [],
};
export default config;
