"use client";

import { useTranslation } from '../../hooks/use-translation';

type Props = {
    roomName: string;
    onCancel: () => void;
};

export default function RoomWaiting({ roomName, onCancel }: Props)
{
    const { t } = useTranslation();

    return (
        <section className="room-waiting">
            <h2>{t.game.roomCreated}</h2>

            <p>{roomName}</p>
            <p>{t.game.waitingForPlayer}</p>

            <button onClick={onCancel}>
                {t.common.cancel}
            </button>
        </section>
    );
}