import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { metaConfig } from '../config/meta';

export default function About() {
  return (
    <main className="p-4 flex items-center justify-center h-screen w-full flex-col">
      <div className="absolute top-4 left-4">
        <Link href="/" passHref>
          <ArrowLeft />
        </Link>
      </div>
      <p className="text-8xl">{metaConfig.emoji}</p>
      <p className="max-w-sm mx-auto">
        <Link
          href="https://tttbbbzzz.bandcamp.com/"
          target="_blank"
          className="underline"
        >
          TBZ
        </Link>{' '}
        and{' '}
        <Link
          target="_blank"
          href="https://jamespants.com/"
          className="underline"
        >
          James Pants
        </Link>{' '}
        started this Euclidean polyrhythm generator a long time ago and finally
        put it out. It works offline and saves locally to your browser storage.
        <br />
        <br />
        No tracking, no third parties, no analytics.
        <br />
        <br />
        <time>April 2, 2024</time>
      </p>
    </main>
  );
}
