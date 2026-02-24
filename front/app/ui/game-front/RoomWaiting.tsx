'use client';

import { useTranslation } from '../../hooks/use-translation';

type Props = {
  roomName: string;
  onCancel: () => void;
};

export default function RoomWaiting({ roomName, onCancel }: Props) {
  const { t } = useTranslation();

  return (
    <section className="room-waiting">
      <h2>{t?.remoteRoomLobbyPage?.title ?? 'Multiplayer lobby'}</h2>

      <p>{roomName}</p>
      <p>{t?.remoteRoomLobbyPage?.waitingMessage ?? 'Waiting for other players to join...'}</p>

      <button type="button" onClick={onCancel}>
        {t?.navigation?.goBack ?? 'Cancel'}
      </button>
    </section>
  );
}
