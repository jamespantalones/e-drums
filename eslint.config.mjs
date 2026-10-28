import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextCoreWebVitals,
  {
    // React Compiler checks; the app doesn't use the compiler
    rules: {
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  { ignores: ['public/**', '.next/**', 'coverage/**'] },
];

export default config;
