import '../styles/globals.css';
import * as React from 'react';
import { flushSync } from 'react-dom';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { AudioContextProvider } from '../contexts/AudioContext';
import { OfflineStorageProvider } from '../contexts/OfflineStorageContext';
import { metaConfig } from '../config/meta';
import { publicUrl } from '../config';
import { monoFont } from '../config/fonts';
import { Hints } from '../components/Hint/Hints';
import { pagesReady } from '../lib/pageTransition';

// pages that morph into each other with a view transition. The old page
// briefly renders against the new route, so each must cope with that (the
// editor keeps its first id)
const TRANSITION_PAGES = ['/', '/about', '/[id]'];
// longest the screen stays frozen waiting for the new page to load
const READY_TIMEOUT = 500;

type Page = Pick<AppProps, 'Component' | 'pageProps'> & { path: string };

/**
 * Keeps showing the old page until the browser has snapshotted it, then
 * swaps in the new one inside document.startViewTransition.
 */
function useViewTransitionPage(next: Page) {
  const [shown, setShown] = React.useState(next);
  const pending = React.useRef<Page | null>(null);

  const animate =
    shown.Component !== next.Component &&
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    TRANSITION_PAGES.includes(shown.path) &&
    TRANSITION_PAGES.includes(next.path);

  const changed =
    shown.Component !== next.Component ||
    shown.pageProps !== next.pageProps ||
    shown.path !== next.path;
  if (changed && !animate) setShown(next);
  pending.current = animate ? next : null;

  React.useEffect(() => {
    if (!pending.current) return;
    const page = pending.current;
    // lets CSS pick per destination, e.g. which wordmark snapshot to show
    const root = document.documentElement;
    root.dataset.transitionFrom = shown.path;
    root.dataset.transitionTo = page.path;
    const transition = document.startViewTransition(async () => {
      flushSync(() => setShown(page));
      await pagesReady(READY_TIMEOUT);
    });
    transition.finished.finally(() => {
      delete root.dataset.transitionFrom;
      delete root.dataset.transitionTo;
    });
  }, [next.Component]);

  return shown;
}

export default function ERhythms({ Component, pageProps, router }: AppProps) {
  const page = useViewTransitionPage({
    Component,
    pageProps,
    path: router.pathname,
  });

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
          href={publicUrl('icons/apple-touch-icon-180x180.png?v=3')}
        />

        <link
          rel="icon"
          href={publicUrl('icons/favicon.ico?v=3')}
          sizes="any"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href={publicUrl('icons/logo.svg?v=3')}
        />

        <meta name="twitter:url" content={metaConfig.canonicalURL} />
        <meta name="twitter:title" content={metaConfig.title} />
        <meta name="twitter:description" content={metaConfig.description} />
        <meta
          name="twitter:image"
          content={publicUrl('icons/pwa-192x192.png')}
        />
        <meta name="twitter:creator" content="@sirjamespants" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaConfig.title} />
        <meta property="og:description" content={metaConfig.description} />
        <meta property="og:site_name" content={metaConfig.title} />
        <meta property="og:url" content={metaConfig.canonicalURL} />
        <meta
          property="og:image"
          content={publicUrl('icons/pwa-512x512.png')}
        />
        {/* expose the font on :root so portals (selects, dialogs) get it too */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { --font-mono: ${monoFont.style.fontFamily}; }`,
          }}
        />
      </Head>

      <AudioContextProvider>
        <OfflineStorageProvider>
          <page.Component {...page.pageProps} />
        </OfflineStorageProvider>
      </AudioContextProvider>
      <Hints />
    </>
  );
}
