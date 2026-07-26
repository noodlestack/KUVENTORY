export const typography = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
    heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }] as [string, { lineHeight: string }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }] as [string, { lineHeight: string }],
    base: ['1rem', { lineHeight: '1.5rem' }] as [string, { lineHeight: string }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }] as [string, { lineHeight: string }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }] as [string, { lineHeight: string }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }] as [string, { lineHeight: string }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }] as [string, { lineHeight: string }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }] as [string, { lineHeight: string }],
    '5xl': ['3rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  }
};
