import {
  ArrowLeft,
  ArrowLeftIcon,
  ChevronLeft,
  Home,
  SidebarClose,
} from 'lucide-react';
import Link from 'next/link';
import { metaConfig } from '../config/meta';

export default function About() {
  return (
    <main className="p-4 flex items-center justify-center h-screen w-full flex-col">
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          passHref
          className="text-neutral-500 hover:text-neutral-100 transition-transform hover:scale-y-75 hover:scale-x-150 block"
        >
          <ChevronLeft strokeWidth={1} size={100} />
        </Link>
      </div>
      <p className="text-8xl mb-8">{metaConfig.emoji}</p>
      <p className="max-w-sm mx-auto text-sm">
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
        put it out.
        <br />
        <br />
        It works offline and saves locally to your browser storage.
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
