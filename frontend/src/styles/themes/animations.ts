export const animations = {
  keyframes: {
    'fade-in': {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    'fade-out': {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    'slide-up': {
      '0%': { transform: 'translateY(10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    'slide-down': {
      '0%': { transform: 'translateY(-10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    'scale-in': {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    'accordion-down': {
      from: { height: '0' },
      to: { height: 'var(--radix-accordion-content-height)' },
    },
    'accordion-up': {
      from: { height: 'var(--radix-accordion-content-height)' },
      to: { height: '0' },
    },
  },
  animation: {
    'fade-in': 'fade-in 0.2s ease-out',
    'fade-out': 'fade-out 0.2s ease-in',
    'slide-up': 'slide-up 0.3s ease-out',
    'slide-down': 'slide-down 0.3s ease-out',
    'scale-in': 'scale-in 0.2s ease-out',
    'accordion-down': 'accordion-down 0.2s ease-out',
    'accordion-up': 'accordion-up 0.2s ease-out',
  },
};
