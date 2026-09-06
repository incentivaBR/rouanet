/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Cores corporativas IncentivaBR
        'incentiva': {
          'primary': '#0c326f',
          'primary-light': '#1e4a94', 
          'secondary': '#1e618d',
          'accent': '#277553',
          'success': '#2e8b57',
          'warning': '#EE985C',
          'gray-light': '#f5f7fa',
          'gray': '#e0e0e0',
          'gray-dark': '#757575'
        },
        // Aliases para facilitar uso
        'primary': '#0c326f',
        'secondary': '#1e618d',
        'success': '#2e8b57',
        'warning': '#EE985C'
      },
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      boxShadow: {
        'incentiva': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'incentiva-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'incentiva-xl': '0 20px 25px rgba(0, 0, 0, 0.1)',
        'compliance': '0 0 0 4px rgba(12, 50, 111, 0.1)'
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0c326f 0%, #1e618d 100%)',
        'gradient-success': 'linear-gradient(135deg, #277553 0%, #2e8b57 100%)',
        'gradient-warning': 'linear-gradient(135deg, #EE985C 0%, #d4822a 100%)',
        'gradient-bg': 'linear-gradient(135deg, #f5f7fa 0%, #e8f4f8 100%)'
      }
    },
  },
  plugins: [
    // Plugin personalizado para utilitários IncentivaBR
    function({ addUtilities }) {
      const newUtilities = {
        '.gradient-primary': {
          background: 'linear-gradient(135deg, #0c326f 0%, #1e618d 100%)'
        },
        '.gradient-success': {
          background: 'linear-gradient(135deg, #277553 0%, #2e8b57 100%)'
        },
        '.gradient-warning': {
          background: 'linear-gradient(135deg, #EE985C 0%, #d4822a 100%)'
        },
        '.compliance-badge': {
          backgroundColor: 'rgba(46, 139, 87, 0.1)',
          border: '2px solid #2e8b57',
          color: '#2e8b57'
        }
      }
      addUtilities(newUtilities)
    }
  ],
}
