"use client";

import { useTranslation } from '../../hooks/use-translation';

type Props = {
    onCreate: () => void;
    onJoin: () => void;
    onBack: () => void;
};

export default function OnlineLobby({ onCreate, onJoin, onBack }: Props)
{
    const { t } = useTranslation();

    return (
        <section className="online-lobby">
            <h2>{t.game.onlinePvp}</h2>

            <button onClick={onCreate}>
                {t.game.createRoom}
            </button>

            <button onClick={onJoin}>
                {t.game.joinRoom}
            </button>

            <button onClick={onBack}>
                {t.common.back}
            </button>
        </section>
    );
}