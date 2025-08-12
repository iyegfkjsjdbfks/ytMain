/** @type {import('tailwindcss').Config} */
export default {
 content: [
 './index.html',
 './src/**/*.{js,ts,jsx,tsx}',
 './App.tsx',
 './index.tsx',
 './components/**/*.{js,ts,jsx,tsx}',
 './pages/**/*.{js,ts,jsx,tsx}',
 './contexts/**/*.{js,ts,jsx,tsx}',
 './hooks/**/*.{js,ts,jsx,tsx}',
 './config/**/*.{js,ts,jsx,tsx}',
 ],
 darkMode: 'class',
 theme: {
 extend: {
 colors: {
 // YouTube brand colors
 youtube: {
 red: '#FF0000',
 'red-dark': '#CC0000',
 'red-light': '#FF4444'
},
 // Custom color palette
 primary: {
 50: '#eff6ff',
 100: '#dbeafe',
 200: '#bfdbfe',
 300: '#93c5fd',
 400: '#60a5fa',
 500: '#3b82f6',
 600: '#2563eb',
 700: '#1d4ed8',
 800: '#1e40af',
 900: '#1e3a8a',
 950: '#172554'
},
 secondary: {
 50: '#f8fafc',
 100: '#f1f5f9',
 200: '#e2e8f0',
 300: '#cbd5e1',
 400: '#94a3b8',
 500: '#64748b',
 600: '#475569',
 700: '#334155',
 800: '#1e293b',
 900: '#0f172a',
 950: '#020617'
},
 accent: {
 50: '#fdf4ff',
 100: '#fae8ff',
 200: '#f5d0fe',
 300: '#f0abfc',
 400: '#e879f9',
 500: '#d946ef',
 600: '#c026d3',
 700: '#a21caf',
 800: '#86198f',
 900: '#701a75',
 950: '#4a044e'
},
 success: {
 50: '#f0fdf4',
 100: '#dcfce7',
 200: '#bbf7d0',
 300: '#86efac',
 400: '#4ade80',
 500: '#22c55e',
 600: '#16a34a',
 700: '#15803d',
 800: '#166534',
 900: '#14532d',
 950: '#052e16'
},
 warning: {
 50: '#fffbeb',
 100: '#fef3c7',
 200: '#fde68a',
 300: '#fcd34d',
 400: '#fbbf24',
 500: '#f59e0b',
 600: '#d97706',
 700: '#b45309',
 800: '#92400e',
 900: '#78350f',
 950: '#451a03'
},
 error: {
 50: '#fef2f2',
 100: '#fee2e2',
 200: '#fecaca',
 300: '#fca5a5',
 400: '#f87171',
 500: '#ef4444',
 600: '#dc2626',
 700: '#b91c1c',
 800: '#991b1b',
 900: '#7f1d1d',
 950: '#450a0a'
}
},
 fontFamily: {
 sans: [
 'Inter',
 'system-ui',
 '-apple-system',
 'BlinkMacSystemFont',
 'Segoe UI',
 'Roboto',
 'Helvetica Neue',
 'Arial',
 'sans-serif',
 ],
 mono: [
 'JetBrains Mono',
 'Fira Code',
 'Monaco',
 'Consolas',
 'Liberation Mono',
 'Courier New',
 'monospace',
 ]
},
 animation: {
 'fade-in': 'fadeIn 0.5s ease-in-out',
 'fade-out': 'fadeOut 0.5s ease-in-out',
 'slide-in-up': 'slideInUp 0.3s ease-out',
 'slide-in-down': 'slideInDown 0.3s ease-out',
 'slide-in-left': 'slideInLeft 0.3s ease-out',
 'slide-in-right': 'slideInRight 0.3s ease-out',
 'bounce-in': 'bounceIn 0.6s ease-out',
 'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
 'spin-slow': 'spin 3s linear infinite',
 'wiggle': 'wiggle 1s ease-in-out infinite',
 'float': 'float 3s ease-in-out infinite',
 'shimmer': 'shimmer 2s linear infinite'
},
 keyframes: {
 fadeIn: {
 '0%': { opacity: '0' },
 '100%': { opacity: '1' }
},
 fadeOut: {
 '0%': { opacity: '1' },
 '100%': { opacity: '0' }
},
 slideInUp: {
 '0%': { transform: 'translateY(100%)', opacity: '0' },
 '100%': { transform: 'translateY(0)', opacity: '1' }
},
 slideInDown: {
 '0%': { transform: 'translateY(-100%)', opacity: '0' },
 '100%': { transform: 'translateY(0)', opacity: '1' }
},
 slideInLeft: {
 '0%': { transform: 'translateX(-100%)', opacity: '0' },
 '100%': { transform: 'translateX(0)', opacity: '1' }
},
 slideInRight: {
 '0%': { transform: 'translateX(100%)', opacity: '0' },
 '100%': { transform: 'translateX(0)', opacity: '1' }
},
 bounceIn: {
 '0%, 20%, 40%, 60%, 80%': {
 transform: 'scale3d(1, 1, 1)',
 animationTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
},
 '0%': {
 opacity: '0',
 transform: 'scale3d(0.3, 0.3, 0.3)'
},
 '20%': {
 transform: 'scale3d(1.1, 1.1, 1.1)'
},
 '40%': {
 transform: 'scale3d(0.9, 0.9, 0.9)'
},
 '60%': {
 opacity: '1',
 transform: 'scale3d(1.03, 1.03, 1.03)'
},
 '80%': {
 transform: 'scale3d(0.97, 0.97, 0.97)'
},
 '100%': {
 opacity: '1',
 transform: 'scale3d(1, 1, 1)'
}
},
 wiggle: {
 '0%, 100%': { transform: 'rotate(-3deg)' },
 '50%': { transform: 'rotate(3deg)' }
},
 float: {
 '0%, 100%': { transform: 'translateY(0px)' },
 '50%': { transform: 'translateY(-10px)' }
},
 shimmer: {
 '0%': { transform: 'translateX(-100%)' },
 '100%': { transform: 'translateX(100%)' }
      }
    },
    boxShadow: {
      'inner-lg': 'inset 0 10px 15px -3px rgba(0, 0, 0, 0.1), inset 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
      'glow-lg': '0 0 40px rgba(59, 130, 246, 0.6)'
    }
 plugins: [
 // Custom plugin for utilities
 function({ addUtilities, addComponents, theme }) {
 const newUtilities = {
 '.scrollbar-hide': {
 /* IE and Edge */
 '-ms-overflow-style': 'none',
 /* Firefox */
 'scrollbar-width': 'none',
 /* Safari and Chrome */
 '&::-webkit-scrollbar': {
 display: 'none'
 }
 },
 '.scrollbar-thin': {
 'scrollbar-width': 'thin',
 '&::-webkit-scrollbar': {
 width: '6px',
 height: '6px'
 },
 '&::-webkit-scrollbar-track': {
 background: theme('colors.gray.100')
 },
 '&::-webkit-scrollbar-thumb': {
 background: theme('colors.gray.300'),
 borderRadius: '3px'
 },
 '&::-webkit-scrollbar-thumb:hover': {
 background: theme('colors.gray.400')
 }
 },
 '.text-shadow': {
 'text-shadow': '0 2px 4px rgba(0,0,0,0.10)'
 },
 '.text-shadow-md': {
 'text-shadow': '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)'
 },
 '.text-shadow-lg': {
 'text-shadow': '0 15px 30px rgba(0,0,0,0.11), 0 5px 15px rgba(0,0,0,0.08)'
 },
 '.text-shadow-none': {
            'text-shadow': 'none'
          }
        };

        const newComponents = {
 '.btn': {
 padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
 borderRadius: theme('borderRadius.md'),
 fontWeight: theme('fontWeight.medium'),
 transition: 'all 0.2s ease-in-out',
 '&:focus': {
 outline: 'none',
 boxShadow: `0 0 0 3px ${theme('colors.primary.500')}40`
}
},
 '.btn-primary': {
 backgroundColor: theme('colors.primary.600'),
 color: theme('colors.white'),
 '&:hover': {
 backgroundColor: theme('colors.primary.700')
},
 '&:active': {
 backgroundColor: theme('colors.primary.800')
}
},
 '.btn-secondary': {
 backgroundColor: theme('colors.secondary.200'),
 color: theme('colors.secondary.800'),
 '&:hover': {
 backgroundColor: theme('colors.secondary.300')
},
 '&:active': {
 backgroundColor: theme('colors.secondary.400')
}
},
 '.card': {
 backgroundColor: theme('colors.white'),
 borderRadius: theme('borderRadius.lg'),
 boxShadow: theme('boxShadow.md'),
 padding: theme('spacing.6')
},
          '.glass': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        };

        addUtilities(newUtilities);
        addComponents(newComponents);
 },
 ]
}