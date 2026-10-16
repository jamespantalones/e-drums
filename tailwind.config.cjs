module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // bg-black / text-black follow the theme's near-black
        black: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        muted: 'var(--color-muted)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        alert: 'var(--color-alert)',
      },
      gridTemplateColumns: {
        16: 'repeat(16, minmax(0, 1fr))',
      },
      fontFamily: {
        term: ['var(--font-term)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // VT323 runs small, so the scale is bumped; line heights stay put
        xxs: ['12px', '8px'],
        xs: ['15px', '11px'],
        sm: ['18px', '20px'],
        base: ['20px', '24px'],
        lg: ['24px', '28px'],
        xl: ['28px', '32px'],
      },
    },
  },
  plugins: [],
};
