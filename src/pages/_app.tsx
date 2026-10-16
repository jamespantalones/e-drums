import '../styles/globals.css';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { AudioContextProvider } from '../contexts/AudioContext';
import { OfflineStorageProvider } from '../contexts/OfflineStorageContext';
import { metaConfig } from '../config/meta';
import { publicUrl } from '../config';
import { termFont } from '../config/fonts';

export default function ERhythms({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>{metaConfig.shortTitle}</title>
        <meta name="description" content={metaConfig.description} />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />

        <link href={publicUrl('manifest.json')} rel="manifest" />

        <meta name="application-name" content={metaConfig.title} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={metaConfig.title} />
        <meta name="description" content={metaConfig.description} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content={metaConfig.themeColor} />

        <link
          rel="apple-touch-icon"
          href={publicUrl('icons/apple-touch-icon-180x180.png')}
        />

        <link rel="icon" href={publicUrl('icons/favicon.ico')} sizes="any" />
        <link
          rel="icon"
          type="image/svg+xml"
          href={publicUrl('icons/logo.svg')}
        />

        <meta name="twitter:url" content={metaConfig.canonicalURL} />
        <meta name="twitter:title" content={metaConfig.title} />
        <meta name="twitter:description" content={metaConfig.description} />
        <meta name="twitter:image" content={publicUrl('icons/pwa-192x192.png')} />
        <meta name="twitter:creator" content="@sirjamespants" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaConfig.title} />
        <meta property="og:description" content={metaConfig.description} />
        <meta property="og:site_name" content={metaConfig.title} />
        <meta property="og:url" content={metaConfig.canonicalURL} />
        <meta property="og:image" content={publicUrl('icons/pwa-512x512.png')} />
        {/* expose the font on :root so portals (selects, dialogs) get it too */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { --font-term: ${termFont.style.fontFamily}; }`,
          }}
        />
      </Head>

      <AudioContextProvider>
        <OfflineStorageProvider>
          <Component {...pageProps} />
        </OfflineStorageProvider>
      </AudioContextProvider>
    </>
  );
}
