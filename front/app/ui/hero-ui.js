import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import HowToPlayUI from './how-to-play-ui';

/**
 * Home hero section with the primary CTA to enter the unified play workflow.
 */
export default function HeroUI() {
  return (
    <section className="hero-ui mb-8 flex flex-col items-center justify-center gap-8">
      <div className="hero-content">
        <h1 className="hero-title mb-4 text-center text-7xl font-black tracking-wide">PONG</h1>
      </div>

      <div className="hero-image text-7xl text-slate-800">
        <Link href="/play" aria-label="Play game" className="transition hover:opacity-70">
          <FontAwesomeIcon icon={faPlay} />
        </Link>
      </div>

      <HowToPlayUI />
    </section>
  );
}
