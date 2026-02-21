'use client';

import { useTranslation } from '../../hooks/use-translation';

type Props = {
  onCreate: () => void;
  onJoin: () => void;
  onBack: () => void;
};

export default function OnlineLobby({ onCreate, onJoin, onBack }: Props) {
  const { t } = useTranslation();
  const backLabel = t?.navigation?.goBack ?? 'Back';

  return (
    <section className="online-lobby">
      <h2>{t?.gameMode?.remote?.title ?? 'Online Multiplayer'}</h2>

      <button type="button" onClick={onCreate}>
        Create room
      </button>

      <button type="button" onClick={onJoin}>
        Join room
      </button>

      <button type="button" onClick={onBack}>
        {backLabel}
      </button>
    </section>
  );
}
