'use client';

import { useTranslation } from '../../hooks/use-translation';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

type Props = {
  onPick: (difficulty: Difficulty) => void;
  onBack: () => void;
};

export default function DifficultySelector({ onPick, onBack }: Props) {
  const { t } = useTranslation();
  const backLabel = t?.navigation?.goBack ?? 'Back';

  return (
    <section className="difficulty-selector">
      <h2>{t?.gameMode?.ai?.title ?? '1 vs AI'}</h2>

      <button type="button" onClick={() => onPick('EASY')}>
        Easy
      </button>

      <button type="button" onClick={() => onPick('MEDIUM')}>
        Medium
      </button>

      <button type="button" onClick={() => onPick('HARD')}>
        Hard
      </button>

      <button type="button" onClick={onBack}>
        {backLabel}
      </button>
    </section>
  );
}
