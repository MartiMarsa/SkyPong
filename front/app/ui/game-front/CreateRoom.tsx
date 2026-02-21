"use client";

import { useState } from 'react';
import { useTranslation } from '../../hooks/use-translation';

type Props = {
    onCreate: (roomName: string) => void;
    onBack: () => void;
    error?: string | null;
    isBusy?: boolean;
};

export default function CreateRoom({ onCreate, onBack, error = null, isBusy = false }: Props)
{
    const { t } = useTranslation();
    const [roomName, setRoomName] = useState("");

    return (
        <section className="create-room">
            <h2>{t.game.createRoom}</h2>

            <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder={t.game.roomNamePlaceholder}
                disabled={isBusy}
            />

            {error ? <p>{error}</p> : null}

            <button onClick={() => onCreate(roomName)} disabled={isBusy}>
                {t.game.createRoom}
            </button>

            <button onClick={onBack} disabled={isBusy}>
                {t.common.back}
            </button>
        </section>
    );
}