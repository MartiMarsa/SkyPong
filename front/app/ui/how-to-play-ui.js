'use client';

import Link from 'next/link';
import { useTranslation } from '../hooks/use-translation';

/**
 * Secondary CTA that routes the player to the game instructions page.
 */
export default function HowToPlayUI() {
  const { t } = useTranslation();

  return (
    <Link
      href="/play"
      className="rounded-lg border-2 border-slate-700 px-4 py-2 text-lg font-semibold text-slate-900 transition hover:bg-slate-200"
    >
      {t.hero.howToPlay}
    </Link>
  );
}
