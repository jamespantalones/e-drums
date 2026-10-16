import { IBM_Plex_Mono } from 'next/font/google';

// self-hosted by next/font, so it keeps working offline. Light by default;
// display lettering is drawn as pixels (Logo/PixelText), not with a font
export const monoFont = IBM_Plex_Mono({
  weight: ['300', '400'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});
