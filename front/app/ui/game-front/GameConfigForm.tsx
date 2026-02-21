'use client';

import { useTranslation } from '../../hooks/use-translation';

type Props = {
  title: string;
  pointsToWin: number;
  ballColor: string;
  onChange: (patch: { pointsToWin?: number; ballColor?: string }) => void;
  primaryCta: string;
  onPrimary: () => void;
  onBack: () => void;
};

export default function GameConfigForm({
  title,
  pointsToWin,
  ballColor,
  onChange,
  primaryCta,
  onPrimary,
  onBack,
}: Props) {
  const { t } = useTranslation();

  return (
    <section className="game-config-form">
      <h2>{title}</h2>

      <div>
        <label htmlFor="game-config-points">Points to win</label>
        <select
          id="game-config-points"
          value={pointsToWin}
          onChange={(event) => onChange({ pointsToWin: Number(event.target.value) })}
        >
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={7}>7</option>
          <option value={9}>9</option>
          <option value={11}>11</option>
        </select>
      </div>

      <div>
        <label htmlFor="game-config-ball-color">Paddle color</label>
        <input
          id="game-config-paddle-color"
          type="color"
          value={ballColor}
          onChange={(event) => onChange({ ballColor: event.target.value })}
        />
      </div>

      <button type="button" onClick={onPrimary}>
        {primaryCta}
      </button>

      <button type="button" onClick={onBack}>
        {t?.navigation?.goBack ?? 'Back'}
      </button>
    </section>
  );
}
