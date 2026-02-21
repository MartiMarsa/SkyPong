'use client';

import { useTranslation } from '../../hooks/use-translation';
import type { GameConfig } from '../../lib/game/launch-config';

type Props = {
  config: GameConfig;
  onExit: () => void;
};

/** Gameplay placeholder screen that receives the verified launch configuration. */
export default function GameScreen({ config, onExit }: Props) {
  const { t } = useTranslation();
  const exitLabel = t?.game?.quit ?? 'Quit';

  return (
    <section className="game-screen">
      <h2>{t?.game?.playButton ?? 'Play'}</h2>

      <pre>{JSON.stringify(config, null, 2)}</pre>

      <button type="button" onClick={onExit}>
        {exitLabel}
      </button>
    </section>
  );
}
