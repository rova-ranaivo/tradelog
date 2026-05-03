/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        evergreen: '#1A7A4A',
        terminal: '#161D2E',
        accent: {
          DEFAULT: '#2558CE',
          dark: '#1A45A8',
          light: 'rgba(37,88,206,0.07)',
          border: 'rgba(37,88,206,0.2)',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          1: '#F9FAFB',
          2: '#EEF1F6',
          3: '#F5F7FA',
        },
        text: {
          DEFAULT: '#161D2E',
          muted: '#4A6080',
          dim: '#8AA0BE',
        },
        pnl: {
          green: '#1A7A4A',
          'green-bg': 'rgba(26,122,74,0.07)',
          red: '#C0392B',
          'red-bg': 'rgba(192,57,43,0.07)',
          amber: '#A06010',
          'amber-bg': 'rgba(160,96,16,0.07)',
        },
        gold: {
          DEFAULT: '#8E6B1E',
          bg: 'rgba(142,107,30,0.07)',
          border: 'rgba(142,107,30,0.2)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '5px',
        lg: '8px',
      },
      boxShadow: {
        DEFAULT: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        lg: '0 6px 20px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
