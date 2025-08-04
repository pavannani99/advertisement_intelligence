/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'terminal': {
          'bg': '#000000',
          'fg': '#ffffff',
          'border': '#333333',
          'hover': '#1a1a1a',
          'active': '#2a2a2a',
          'muted': '#888888',
          'accent': '#ffffff',
        }
      },
      fontFamily: {
        'mono': ['Berkeley Mono', 'JetBrains Mono', 'Consolas', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 0.3s steps(1)',
        'cursor-blink': 'cursor-blink 1s steps(1) infinite',
      },
      keyframes: {
        typing: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'cursor-blink': {
          '0%, 50%': { opacity: 1 },
          '51%, 100%': { opacity: 0 },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
