import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      colors: {
        paper: {
          DEFAULT: "#FAF7F2",
          surface: "#FFFFFF",
          sand: "#F2ECE1",
          dot: "#DED6C8",
        },
        ink: {
          DEFAULT: "#1F2421",
          muted: "#5A625E",
        },
        terracotta: {
          DEFAULT: "#D95D39",
          hover: "#C04B29",
          deep: "#9C381B",
          highlight: "rgba(217, 93, 57, 0.2)",
        },
        sage: {
          DEFAULT: "#2D5A4C",
          soft: "#E1EFE9",
          text: "#225444",
          border: "#BFD9CE",
        },
        clay: {
          soft: "#FAE6E0",
          text: "#A83C1D",
          border: "#ECC3B6",
        },
        warmSand: {
          badge: "#EFE6D8",
          text: "#7C4A2D",
          border: "#DFD1BC",
        },
        warmBorder: {
          DEFAULT: "#E3DCD0",
          hard: "#CFC5B4",
        },
      },
      boxShadow: {
        'tactile-card': '0 2px 0 #CFC5B4',
        'tactile-primary': '0 3px 0 #9C381B',
        'tactile-modal': '0 6px 0 rgba(31, 36, 33, 0.28)',
      },
    },
  },
  plugins: [],
};
export default config;
