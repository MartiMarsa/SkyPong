'use client';

import { useTranslation } from '../../hooks/use-translation';

export default function GameLoader() {
  const { t } = useTranslation();
  const loadingLabel = t?.signInPage?.loading ?? 'Loading...';

  return (
    <section className="game-loader" aria-live="polite">
      <p>{loadingLabel}</p>
    </section>
  );
}
