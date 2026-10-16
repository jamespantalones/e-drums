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
        danger: 'var(--color-danger)',
      },
      gridTemplateColumns: {
        16: 'repeat(16, minmax(0, 1fr))',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // compact scale for the dense editor; line heights stay put
        xxs: ['9px', '8px'],
        xs: ['11px', '11px'],
        sm: ['13px', '20px'],
        base: ['15px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '32px'],
      },
    },
  },
  plugins: [],
};
