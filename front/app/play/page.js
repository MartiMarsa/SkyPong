'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CreateRoom from '../ui/game-front/CreateRoom';
import DifficultySelector from '../ui/game-front/DifficultySelector';
import GameConfigForm from '../ui/game-front/GameConfigForm';
import GameLoader from '../ui/game-front/GameLoader';
import GameModeSelection from '../ui/game-front/GameModeSelection';
import JoinRoom from '../ui/game-front/JoinRoom';
import LocalSetup from '../ui/game-front/LocalSetup';
import OnlineLobby from '../ui/game-front/OnlineLobby';
import RoomWaiting from '../ui/game-front/RoomWaiting';
import { encodeGameConfig } from '../lib/game/launch-config';
import { useAuth } from '../context/auth-context';

const STATES = {
  SELECT_MODE: 'SELECT_MODE',
  AI_SELECT_DIFFICULTY: 'AI_SELECT_DIFFICULTY',
  CONFIGURE_GAME: 'CONFIGURE_GAME',
  MULTIPLAYER_MENU: 'MULTIPLAYER_MENU',
  ONLINE_LOBBY: 'ONLINE_LOBBY',
  ONLINE_CREATE_ROOM: 'ONLINE_CREATE_ROOM',
  ONLINE_JOIN_ROOM: 'ONLINE_JOIN_ROOM',
  ONLINE_WAITING: 'ONLINE_WAITING',
  LOCAL_P1_SETUP: 'LOCAL_P1_SETUP',
  LOCAL_P2_SETUP: 'LOCAL_P2_SETUP',
  LOADING: 'LOADING',
};

const INITIAL_CONFIG = {
  mode: 'AI',
  pointsToWin: 5,
  ballColor: '#ffffff',
};

/**
 * Game setup finite-state workflow that always launches gameplay through /launch.
 */
export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState(STATES.SELECT_MODE);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [rooms, setRooms] = useState([]);
  const [currentRoomName, setCurrentRoomName] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
//   const [hasCredentials, setHasCredentials ] = useState(false);

  const {checkAuth , hasCredentials} = useAuth();
  const error = useMemo(() => searchParams.get('error'), [searchParams]);

  useEffect(() => {
    console.log("Has creds: ", hasCredentials);
    if (state !== STATES.LOADING) {
      return undefined;
    }

    const launchTimer = window.setTimeout(() => {
      const encoded = encodeGameConfig(config);
      router.push(`/launch?config=${encodeURIComponent(encoded)}`); // INFO redirects to /front/launch
    }, 800);

    return () => window.clearTimeout(launchTimer);
  }, [config, router, state]);

  useEffect(() => {
    if (state !== STATES.ONLINE_WAITING) {
      return undefined;
    }

    const readyTimer = window.setTimeout(() => {
      setState(STATES.CONFIGURE_GAME);
    }, 1500);
    
    (async () => (await checkAuth()));
    return () => window.clearTimeout(readyTimer);
  }, [state]);

  const refreshRooms = () => {
    setLoadingRooms(true);
    window.setTimeout(() => {
      setRooms([
        { id: 'room-alpha', name: 'Room Alpha', players: 1, status: 'WAITING' },
        { id: 'room-beta', name: 'Room Beta', players: 1, status: 'WAITING' },
      ]);
      setLoadingRooms(false);
    }, 400);
  };

  const startLoadingWithConfig = (nextConfig) => {
    setConfig(nextConfig);
    setState(STATES.LOADING);
  };

  if (state === STATES.LOADING) {
    return <GameLoader />;
  }

  return (
    <main>
      {error ? <p>{`Error: ${error}`}</p> : null}

      {console.log("User hascredentials in play: ", hasCredentials)}
      {state === STATES.SELECT_MODE ? (
        <GameModeSelection
          isLogged={hasCredentials}
          onSelectAI={() => {
            setConfig((prev) => ({ ...prev, mode: 'AI', roomId: undefined, onlineRole: undefined }));
            setState(STATES.AI_SELECT_DIFFICULTY);
          }}
          onSelectMultiplayer={() => setState(STATES.MULTIPLAYER_MENU)}
        />
      ) : null}

      {state === STATES.AI_SELECT_DIFFICULTY ? (
        <DifficultySelector
          onPick={(difficulty) => {
            setConfig((prev) => ({ ...prev, mode: 'AI', difficulty }));
            setState(STATES.CONFIGURE_GAME);
          }}
          onBack={() => setState(STATES.SELECT_MODE)}
        />
      ) : null}

      {state === STATES.MULTIPLAYER_MENU && hasCredentials ? (
        <section>
          <h2>Multiplayer</h2>
          <button type="button" onClick={() => setState(STATES.ONLINE_LOBBY)}>
            Online PVP
          </button>
          <button
            type="button"
            onClick={() => {
              setConfig((prev) => ({ ...prev, mode: 'LOCAL', difficulty: undefined, roomId: undefined, onlineRole: undefined }));
              setState(STATES.LOCAL_P1_SETUP);
            }}
          >
            Local PVP
          </button>
          <button type="button" onClick={() => setState(STATES.SELECT_MODE)}>
            Back
          </button>
        </section>
      ) : null}

      {state === STATES.ONLINE_LOBBY ? (
        <OnlineLobby
          onCreate={() => setState(STATES.ONLINE_CREATE_ROOM)}
          onJoin={() => {
            refreshRooms();
            setState(STATES.ONLINE_JOIN_ROOM);
          }}
          onBack={() => setState(STATES.MULTIPLAYER_MENU)}
        />
      ) : null}

      {state === STATES.ONLINE_CREATE_ROOM ? (
        <CreateRoom
          onCreate={(roomName) => {
            const generatedRoomId = `room-${Math.random().toString(36).slice(2, 8)}`;
            setConfig((prev) => ({
              ...prev,
              mode: 'ONLINE',
              roomId: generatedRoomId,
              onlineRole: 'create',
              difficulty: undefined,
            }));
            setCurrentRoomName(roomName);
            setState(STATES.ONLINE_WAITING);
          }}
          onBack={() => setState(STATES.ONLINE_LOBBY)}
        />
      ) : null}

      {state === STATES.ONLINE_JOIN_ROOM ? (
        <JoinRoom
          rooms={rooms}
          isLoading={loadingRooms}
          onRefresh={refreshRooms}
          onJoin={(roomId) => {
            setConfig((prev) => ({ ...prev, mode: 'ONLINE', roomId, onlineRole: 'join', difficulty: undefined }));
            setState(STATES.CONFIGURE_GAME);
          }}
          onBack={() => setState(STATES.ONLINE_LOBBY)}
        />
      ) : null}

      {state === STATES.ONLINE_WAITING ? (
        <RoomWaiting roomName={currentRoomName} onCancel={() => setState(STATES.ONLINE_LOBBY)} />
      ) : null}

      {state === STATES.CONFIGURE_GAME ? (
        <GameConfigForm
          title="Configure game"
          pointsToWin={config.pointsToWin}
          ballColor={config.ballColor}
          onChange={(patch) => setConfig((prev) => ({ ...prev, ...patch }))}
          primaryCta="Play"
          onPrimary={() => startLoadingWithConfig(config)}
          onBack={() =>
            setState(config.mode === 'AI' ? STATES.AI_SELECT_DIFFICULTY : STATES.ONLINE_LOBBY)
          }
        />
      ) : null}

      {state === STATES.LOCAL_P1_SETUP ? (
        <LocalSetup
          player={1}
          pointsToWin={config.pointsToWin}
          ballColor={config.ballColor}
          onChange={(patch) => setConfig((prev) => ({ ...prev, ...patch }))}
          onNext={() => setState(STATES.LOCAL_P2_SETUP)}
          onBack={() => setState(STATES.MULTIPLAYER_MENU)}
        />
      ) : null}

      {state === STATES.LOCAL_P2_SETUP ? (
        <LocalSetup
          player={2}
          pointsToWin={config.pointsToWin}
          ballColor={config.ballColor}
          onChange={(patch) => setConfig((prev) => ({ ...prev, ...patch }))}
          onNext={() => startLoadingWithConfig(config)}
          onBack={() => setState(STATES.LOCAL_P1_SETUP)}
        />
      ) : null}
    </main>
  );
}
