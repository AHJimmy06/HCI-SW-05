/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#a1b6fb',
          400: '#6d8bf7',
          500: '#3b447a', // Primary brand color - deep indigo
          600: '#2c3366', // Strong contrast primary
          700: '#1e234d', // Deeper primary
          800: '#141733',
          900: '#0a0b1a',
        },
        accent: {
          50: '#fdf8f6',
          100: '#fbece7',
          200: '#f6d5ca',
          300: '#eeaf9c',
          400: '#e48268',
          500: '#d95d39', // Accent for important actions
          600: '#c5492a',
          700: '#a43823',
          800: '#842f20',
          900: '#69281c',
        },
        surface: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        }
      },
      animation: {
        shake: "shake 0.2s ease-in-out 0s 2",
      }
    },
  },
  plugins: [],
}