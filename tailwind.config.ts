import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neo-Brutalism Primary Colors (박달초 테마)
        primary: {
          DEFAULT: "#FFE135",
          light: "#FFF59F",
          dark: "#FFD700",
        },
        secondary: {
          DEFAULT: "#FF6B6B",
          light: "#FF9F9F",
          dark: "#f76363",
        },
        accent: {
          DEFAULT: "#4ECDC4",
          light: "#A6FAFF",
          dark: "#53f2fc",
        },
        // Neo-Brutalism Color Palette
        neo: {
          yellow: {
            200: "#FFF59F",
            300: "#FFF066",
            400: "#FFE500",
          },
          pink: {
            200: "#FFA6F6",
            300: "#fa8cef",
            400: "#fa7fee",
          },
          red: {
            200: "#FF9F9F",
            300: "#fa7a7a",
            400: "#f76363",
          },
          orange: {
            200: "#FFC29F",
            300: "#FF965B",
            400: "#fa8543",
          },
          lime: {
            200: "#B8FF9F",
            300: "#9dfc7c",
            400: "#7df752",
          },
          cyan: {
            200: "#A6FAFF",
            300: "#79F7FF",
            400: "#53f2fc",
          },
          violet: {
            200: "#A8A6FF",
            300: "#918efa",
            400: "#807dfa",
          },
        },
        // Semantic Colors
        surface: "#FFFFFF",
        background: "#FEFEFE",
        text: "#1A1A2E",
        border: "#000000",
        success: "#7BED9F",
        warning: "#FECA57",
        error: "#FF6B6B",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Noto Sans KR",
          "sans-serif",
        ],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      boxShadow: {
        // Neo-Brutalism Shadows (hard, no blur)
        "neo-sm": "2px 2px 0px 0px rgba(0,0,0,1)",
        "neo": "4px 4px 0px 0px rgba(0,0,0,1)",
        "neo-md": "6px 6px 0px 0px rgba(0,0,0,1)",
        "neo-lg": "8px 8px 0px 0px rgba(0,0,0,1)",
        "neo-xl": "12px 12px 0px 0px rgba(0,0,0,1)",
        // Hover states (pressed effect)
        "neo-pressed": "2px 2px 0px 0px rgba(0,0,0,1)",
      },
      borderWidth: {
        "3": "3px",
        "4": "4px",
      },
      animation: {
        "bounce-sm": "bounce-sm 0.3s ease-in-out",
        "shake": "shake 0.5s ease-in-out",
      },
      keyframes: {
        "bounce-sm": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
