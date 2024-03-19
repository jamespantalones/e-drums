import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  return (
    <main className="p-4 flex items-center justify-center h-screen w-full">
      <div className="absolute top-4 left-4">
        <Link href="/" passHref>
          <ArrowLeft />
        </Link>
      </div>
      <p className="max-w-sm mx-auto">
        <a
          target="_blank"
          className="underline"
          href="https://tttbbbzzz.bandcamp.com/"
          rel="noreferrer"
        >
          TBZ
        </a>{' '}
        and{' '}
        <a className="underline" href="https://jamespants.com/">
          James Pants
        </a>{' '}
        made this a while back and finally put it out in 2024.
      </p>
    </main>
  );
}
