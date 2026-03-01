'use client';

import { useTranslation } from '../../hooks/use-translation';

type Props = {
  player: 1 | 2;
  pointsToWin: number;
  ballColor: string;
  onChange: (patch: { winningScore?: number; playerColor?: string }) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function LocalSetup({
  player,
  pointsToWin,
  ballColor,
  onChange,
  onNext,
  onBack,
}: Props) {
  const { t } = useTranslation();
  const backLabel = t?.navigation?.goBack ?? 'Back';
  const playLabel = t?.game?.playButton ?? 'Play';

  return (
    <section className="local-setup">
      <h2>{t?.gameMode?.local?.title ?? '1 vs 1 Local'}</h2>
      <p>{`Player ${player}`}</p>

      <div>
        <label htmlFor="local-setup-points">Points to win</label>
        <select
          id="local-setup-points"
          value={pointsToWin}
          onChange={(event) => onChange({ winningScore: Number(event.target.value) })}
        >
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={7}>7</option>
          <option value={9}>9</option>
          <option value={11}>11</option>
        </select>
      </div>

      <div>
        <label htmlFor="local-setup-paddle-color">Paddle color</label>
        <input
          id="local-setup-paddle-color"
          type="color"
          value={ballColor}
          onChange={(event) => onChange({ playerColor: event.target.value })}
        />
      </div>

      <button type="button" onClick={onNext}>
        {player === 1 ? 'Next player' : playLabel}
      </button>

      <button type="button" onClick={onBack}>
        {backLabel}
      </button>
    </section>
  );
}
