"use client";

import { useTranslation } from '../../hooks/use-translation';

export type Room = {
    id: string;
    name: string;
    players?: number;
    status?: string;
};

type Props = {
    rooms: Room[];
    isLoading: boolean;
    error?: string | null;

    onRefresh: () => void;
    onJoin: (roomId: string) => void;
    onBack: () => void;
};

export default function JoinRoom({
    rooms,
    isLoading,
    error = null,
    onRefresh,
    onJoin,
    onBack
}: Props)
{
    const { t } = useTranslation();

    return (
        <section className="join-room">
            <h2>{t.game.roomList}</h2>

            <button onClick={onRefresh} disabled={isLoading}>
                {isLoading ? t.common.loading : t.common.refresh}
            </button>

            {error ? <p>{error}</p> : null}

            {!isLoading && rooms.length === 0 ? (
                <p>{t.game.noRooms}</p>
            ) : null}

            <ul>
                {rooms.map((room) => (
                    <li key={room.id}>
                        <span>{room.name}</span>
                        <button onClick={() => onJoin(room.id)}>
                            {t.game.joinRoom}
                        </button>
                    </li>
                ))}
            </ul>

            <button onClick={onBack}>
                {t.common.back}
            </button>
        </section>
    );
}