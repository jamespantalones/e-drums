import { ArrowLeft, Home } from 'lucide-react';
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
        TK TK TK Put some information and links here. TK TK TK Put some
        information and links here. TK TK TK Put some information and links
        here. TK TK TK Put some information and links here
      </p>
    </main>
  );
}
