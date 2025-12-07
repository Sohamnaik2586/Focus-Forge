/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - Deep Indigo with vibrant accent
        primary: {
          50: '#F0F3FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          DEFAULT: '#6366F1', // Main primary
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        
        // Accent Colors - Vibrant Teal
        accent: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          DEFAULT: '#14B8A6', // Main accent
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        
        // Success - Fresh Green
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBEF63',
          300: '#86EFAC',
          400: '#4ADE80',
          DEFAULT: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#145231',
        },
        
        // Danger/Error - Warm Red
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          DEFAULT: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        
        // Warning - Warm Amber
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          DEFAULT: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        
        // Info - Cool Blue
        info: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          DEFAULT: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        
        // Light Mode Colors (flattened for Tailwind compatibility)
        'light-bg': 'var(--color-light-bg)',
        'light-card': 'var(--color-light-card)',
        'light-hover': 'var(--color-light-hover)',
        'light-border': 'var(--color-light-border)',
        'light-text-primary': 'var(--color-light-text-primary)',
        'light-text-secondary': 'var(--color-light-text-secondary)',
        'light-text-tertiary': 'var(--color-light-text-tertiary)',
        
        // Dark Mode Colors (flattened for Tailwind compatibility)
        'dark-bg': 'var(--color-dark-bg)',
        'dark-bg2': 'var(--color-dark-bg)',
        'dark-card': 'var(--color-dark-card)',
        'dark-hover': 'var(--color-dark-hover)',
        'dark-border': 'var(--color-dark-border)',
        'dark-text-primary': 'var(--color-dark-text-primary)',
        'dark-text-secondary': 'var(--color-dark-text-secondary)',
        'dark-text-tertiary': 'var(--color-dark-text-tertiary)',
      },
      
      backgroundColor: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
      },
      
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}