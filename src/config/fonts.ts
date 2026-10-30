import { IBM_Plex_Mono } from 'next/font/google';

// self-hosted by next/font, so it keeps working offline. Light by default;
// bold for the stretched wordmark (Logo/StretchText)
export const monoFont = IBM_Plex_Mono({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});
