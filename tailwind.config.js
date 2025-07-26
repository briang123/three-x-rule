/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'kitchen-white': '#fefefe',
        'kitchen-off-white': '#f8f9fa',
        'kitchen-light-gray': '#f1f3f4',
        'kitchen-muted-blue': '#e8f4fd',
        'kitchen-accent-blue': '#3b82f6',
        'kitchen-text': '#374151',
        'kitchen-text-light': '#6b7280',
        // Dark mode colors
        'kitchen-dark-bg': '#0f172a',
        'kitchen-dark-surface': '#1e293b',
        'kitchen-dark-surface-light': '#334155',
        'kitchen-dark-border': '#475569',
        'kitchen-dark-text': '#f1f5f9',
        'kitchen-dark-text-light': '#94a3b8',
        'kitchen-dark-muted-blue': '#1e3a8a',
        'kitchen-dark-accent-blue': '#60a5fa',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        'sf-pro': ['SF Pro Display', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
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
        bounceGentle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
