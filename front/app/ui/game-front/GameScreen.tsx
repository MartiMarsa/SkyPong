"use client";

import { useTranslation } from '../../hooks/use-translation';

export type GameConfig = {
    mode: "AI" | "ONLINE" | "LOCAL";
    difficulty?: "EASY" | "MEDIUM" | "HARD";
    pointsToWin: number;
    ballColor: string;
    roomId?: string;
};

type Props = {
    config: GameConfig;
    onExit: () => void;
};

export default function GameScreen({ config, onExit }: Props)
{
    const { t } = useTranslation();

    return (
        <section className="game-screen">
            <h2>{t.game.playing}</h2>

            <pre>
                {JSON.stringify(config, null, 2)}
            </pre>

            <button onClick={onExit}>
                {t.common.exit}
            </button>
        </section>
    );
}