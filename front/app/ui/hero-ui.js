import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useTranslation } from '../hooks/use-translation';

/**
 * Home hero section with the primary CTA to enter the unified play workflow.
 */
export default function HeroUI() {
  const { t } = useTranslation();

  return (
    <section className="hero-ui flex flex-col justify-center items-center mb-8">
      <div className="hero-content">
        <h1 className="hero-title text-4xl font-bold mb-4 text-center">{t.homePage.title}</h1>
        <p className="hero-subtitle text-lg text-center">{t.homePage.description}</p>
      </div>

      <div className="hero-image text-7xl">
        <Link href="/play" aria-label="Play game">
          <FontAwesomeIcon icon={faPlay} />
        </Link>
      </div>
    </section>
  );
}
