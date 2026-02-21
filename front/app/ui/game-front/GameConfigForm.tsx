"use client";

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
    onBack
}: Props)
{
    const { t } = useTranslation();

    return (
        <section className="game-config-form">
            <h2>{title}</h2>

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

            <button onClick={onPrimary}>
                {primaryCta}
            </button>

            <button onClick={onBack}>
                {t.common.back}
            </button>
        </section>
    );
}