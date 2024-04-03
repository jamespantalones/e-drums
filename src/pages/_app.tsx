import '../styles/globals.css';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { AudioContextProvider } from '../contexts/AudioContext';
import { OfflineStorageProvider } from '../contexts/OfflineStorageContext';
import { metaConfig } from '../config/meta';

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

        <link href="/manifest.json" rel="manifest" />

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
          href="/icons/apple-touch-icon-180x180.png"
        />

        <link rel="shortcut icon" href="/icons/favicon.ico" />

        <meta name="twitter:url" content={metaConfig.canonicalURL} />
        <meta name="twitter:title" content={metaConfig.title} />
        <meta name="twitter:description" content={metaConfig.description} />
        <meta name="twitter:image" content="/icons/pwa-192x192.png" />
        <meta name="twitter:creator" content="@sirjamespants" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaConfig.title} />
        <meta property="og:description" content={metaConfig.description} />
        <meta property="og:site_name" content={metaConfig.title} />
        <meta property="og:url" content={metaConfig.canonicalURL} />
        <meta property="og:image" content="/icons/apple-touch-icon.png" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>𓀔</text></svg>"
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
