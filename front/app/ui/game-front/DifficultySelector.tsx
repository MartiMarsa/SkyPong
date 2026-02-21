"use client";

import { useTranslation } from '../../hooks/use-translation';

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

type Props = {
    onPick: (difficulty: Difficulty) => void;
    onBack: () => void;
};

export default function DifficultySelector({ onPick, onBack }: Props)
{
    const { t } = useTranslation();

    return (
        <section className="difficulty-selector">
            <h2>{t.game.chooseDifficulty}</h2>

            <button onClick={() => onPick("EASY")}>
                {t.game.easy}
            </button>

            <button onClick={() => onPick("MEDIUM")}>
                {t.game.medium}
            </button>

            <button onClick={() => onPick("HARD")}>
                {t.game.difficult}
            </button>

            <button onClick={onBack}>
                {t.common.back}
            </button>
        </section>
    );
}