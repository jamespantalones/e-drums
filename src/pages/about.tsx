import Link from 'next/link';
import { PixelText, Wordmark } from '../components/Logo/Logo';

const LINK =
  'underline decoration-2 underline-offset-4 hover:bg-white hover:text-black';

const FACTS = [
  'Works offline',
  'Saves to your browser',
  'No tracking',
  'No third parties',
  'No analytics',
];

export default function About() {
  return (
    <main className="full-bleed min-h-screen bg-black text-white font-term tracking-normal">
      <header className="flex items-stretch border-b-4 border-white">
        <Link
          href="/"
          className="flex items-center border-r-4 border-white px-4 md:px-8 hover:bg-white hover:text-black"
        >
          <PixelText text="Back" label="Back" className="h-5 md:h-7 w-auto" />
        </Link>
        <Link href="/" className="block flex-1 p-4 md:p-6">
          <Wordmark className="block h-auto w-full" />
          <span className="sr-only">e-drums home</span>
        </Link>
      </header>

      <p className="p-4 md:p-6 max-w-5xl text-3xl md:text-5xl leading-[1.05]">
        <Link href="https://tttbbbzzz.com/" target="_blank" className={LINK}>
          TBZ
        </Link>{' '}
        and{' '}
        <Link href="https://jamespants.com/" target="_blank" className={LINK}>
          James Pants
        </Link>{' '}
        started this Euclidean polyrhythm generator a long time ago and finally
        put it out.
      </p>

      <ul className="border-t-4 border-white">
        {FACTS.map((fact) => (
          <li key={fact} className="border-b-4 border-white p-4 md:px-6">
            <PixelText text={fact} label={fact} className="h-5 md:h-7 w-auto" />
          </li>
        ))}
      </ul>

      <p className="p-4 md:p-6 text-2xl md:text-3xl text-neutral-400">
        <time dateTime="2024-04-02">April 2, 2024</time>
      </p>
    </main>
  );
}
