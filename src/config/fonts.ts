import { VT323 } from 'next/font/google';

// self-hosted by next/font, so it keeps working offline
export const termFont = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-term',
  display: 'swap',
});
