"use client";

import { useTranslation } from '../../hooks/use-translation';

type Props = {
    player: 1 | 2;

    pointsToWin: number;
    ballColor: string;

    onChange: (patch: { pointsToWin?: number; ballColor?: string }) => void;

    onNext: () => void;
    onBack: () => void;
};

export default function LocalSetup({
    player,
    pointsToWin,
    ballColor,
    onChange,
    onNext,
    onBack
}: Props)
{
    const { t } = useTranslation();

    return (
        <section className="local-setup">
            <h2>{t.game.localPvp}</h2>
            <p>{t.game.player} {player}</p>

            <div>
                <label>{t.game.choosePoints}</label>
                <select
                    value={pointsToWin}
                    onChange={(e) => onChange({ pointsToWin: Number(e.target.value) })}
                >
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={7}>7</option>
                    <option value={9}>9</option>
                    <option value={11}>11</option>
                </select>
            </div>

            <div>
                <label>{t.game.chooseBallColor}</label>
                <input
                    type="color"
                    value={ballColor}
                    onChange={(e) => onChange({ ballColor: e.target.value })}
                />
            </div>

            <button onClick={onNext}>
                {player === 1 ? t.game.nextPlayer : t.game.play}
            </button>

            <button onClick={onBack}>
                {t.common.back}
            </button>
        </section>
    );
}