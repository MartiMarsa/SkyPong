'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { encodeConfig } from '../lib/game/game-session-config';
import { getAvailableRooms } from '../lib/game/room-service';
import { useAuth } from '../context/auth-context';
import { useStyles } from '../hooks/use-styles';
import { useTranslation } from '../hooks/use-translation';
import FooterTermsPolicy from '../ui/footer-terms-policy';
import NavigationAppUI from '../ui/navigation-app-ui';

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
  PLAYING: 'PLAYING',
};

const INITIAL_CONFIG = {
  playerName: '',
  playerColor: '#00A6ED',
  gameMode: 'ai-easy',
  winningScore: 5,
};

const PLAYER_COLORS = [
  { hex: '#F6511D', name: 'Red-Orange' },
  { hex: '#00A6ED', name: 'Cyan Blue' },
  { hex: '#B084CC', name: 'Purple' },
  { hex: '#6B8F71', name: 'Sage Green' },
  { hex: '#F4E04D', name: 'Yellow' },
];

const mobileStyles = {
  main: 'h-dvh bg-[#d9d9d9] text-slate-900',
};

const desktopStyles = {
  main: 'h-dvh overflow-hidden bg-[#d9d9d9] px-6 text-slate-900 lg:px-10',
};

const panelButton =
  'w-full rounded-2xl border-2 border-slate-700 bg-[#efefef] px-5 py-3 text-base font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60';

function ColorPicker({ selectedColor, onColorSelect, label }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold uppercase tracking-wide text-slate-700">{label}</label>
      <div className="flex flex-wrap gap-3">
        {PLAYER_COLORS.map((color) => (
          <button
            key={color.hex}
            type="button"
            onClick={() => onColorSelect(color.hex)}
            title={color.name}
            className="h-10 w-10 rounded-full border-2 transition"
            style={{
              backgroundColor: color.hex,
              borderColor: selectedColor === color.hex ? '#0f172a' : 'transparent',
              boxShadow: selectedColor === color.hex ? `0 0 0 3px ${color.hex}80` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GameOverlay({ gameUrl, onExit }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'game-exit') {
        onExit();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black">
      <iframe
        ref={iframeRef}
        src={gameUrl}
        title="Game"
        className="h-full w-full border-0"
        allow="cross-origin-isolated"
      />
    </div>
  );
}

function PlayPanel({ title, subtitle, children }) {
  return (
    <section className="w-full max-w-lg rounded-[2rem] border-2 border-slate-700 bg-[#e7e7e7]/70 p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="text-sm font-semibold text-slate-700 sm:text-base">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { styles } = useStyles(mobileStyles, desktopStyles);
  const [state, setState] = useState(STATES.SELECT_MODE);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomError, setRoomError] = useState(null);
  const [gameUrl, setGameUrl] = useState('');

  const { user, hasCredentials } = useAuth();
  const { locale } = useTranslation();
  const error = useMemo(() => searchParams.get('error'), [searchParams]);

  useEffect(() => {
    if (user?.nickname) {
      setConfig((prev) => ({ ...prev, playerName: user.nickname }));
    }
  }, [user]);

  useEffect(() => {
    if (state !== STATES.LOADING && state !== STATES.PLAYING) {
      return undefined;
    }

    const finalConfig = {
      ...config,
      playerId: user?.id,
      playerName: config.playerName || user?.nickname || 'Player 1',
      language: locale,
    };
    const encoded = encodeConfig(finalConfig);
    const url = `/game-engine/canvas?config=${encodeURIComponent(encoded)}`;

    if (state === STATES.LOADING) {
      const loadTimer = window.setTimeout(() => {
        setGameUrl(url);
        setState(STATES.PLAYING);
      }, 800);
      return () => window.clearTimeout(loadTimer);
    }

    setGameUrl(url);
    return undefined;
  }, [config, state, user]);

  useEffect(() => {
    if (state !== STATES.ONLINE_WAITING) {
      return undefined;
    }

    const readyTimer = window.setTimeout(() => {
      setState(STATES.LOADING);
    }, 1500);

    return () => window.clearTimeout(readyTimer);
  }, [state]);

  const handleGameExit = () => {
    setGameUrl('');
    setState(STATES.SELECT_MODE);
  };

  const refreshRooms = async () => {
    setLoadingRooms(true);
    setRoomError(null);
    try {
      const availableRooms = await getAvailableRooms();
      setRooms(availableRooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      setRoomError('Failed to load rooms. Please try again.');
    } finally {
      setLoadingRooms(false);
    }
  };

  const startLoadingWithConfig = (nextConfig) => {
    setConfig(nextConfig);
    setState(STATES.LOADING);
  };

  if (state === STATES.LOADING) {
    return (
      <main className={`${styles.main} overflow-hidden`}>
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col rounded-[2.5rem] border-2 border-slate-700 px-4 py-6 sm:px-8 sm:py-8">
          <NavigationAppUI userURL={hasCredentials ? '/user-home' : '/login'} compactGuestActions />
          <section className="flex min-h-0 flex-1 items-center justify-center">
            <PlayPanel title="Pong" subtitle="Loading game..." />
          </section>
          <div className="pt-4 text-slate-800">
            <FooterTermsPolicy />
          </div>
        </div>
      </main>
    );
  }

  if (state === STATES.PLAYING && gameUrl) {
    return <GameOverlay gameUrl={gameUrl} onExit={handleGameExit} />;
  }

  return (
    <main className={`${styles.main} overflow-hidden`}>
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col rounded-[2.5rem] border-2 border-slate-700 px-4 py-6 sm:px-8 sm:py-8">
        <NavigationAppUI userURL={hasCredentials ? '/user-home' : '/login'} compactGuestActions />

        <section className="flex min-h-0 flex-1 items-center justify-center py-4 md:py-6 lg:py-10">
          <div className="flex w-full flex-col items-center gap-4">
            {error && <p className="text-sm font-semibold text-red-600">Error: {error}</p>}

            {state === STATES.SELECT_MODE && (
              <PlayPanel title="Pong" subtitle="Choose game mode">
                <button
                  type="button"
                  className={panelButton}
                  onClick={() => {
                    setConfig((prev) => ({ ...prev, gameMode: 'local-2p' }));
                    setState(STATES.LOCAL_P1_SETUP);
                  }}
                >
                  1 vs 1 · Local
                </button>
                <button
                  type="button"
                  className={panelButton}
                  onClick={() => {
                    setConfig((prev) => ({ ...prev, gameMode: 'ai-easy' }));
                    setState(STATES.AI_SELECT_DIFFICULTY);
                  }}
                >
                  1 vs AI
                </button>
                {hasCredentials && (
                  <button type="button" className={panelButton} onClick={() => setState(STATES.MULTIPLAYER_MENU)}>
                    Multiplayer
                  </button>
                )}
                <button type="button" className={panelButton} onClick={() => router.push('/')}>Back</button>
              </PlayPanel>
            )}

            {state === STATES.AI_SELECT_DIFFICULTY && (
              <PlayPanel title="AI" subtitle="Select difficulty">
                <button type="button" className={panelButton} onClick={() => {
                  setConfig((prev) => ({ ...prev, gameMode: 'ai-easy' }));
                  setState(STATES.CONFIGURE_GAME);
                }}>
                  Easy
                </button>
                <button type="button" className={panelButton} onClick={() => {
                  setConfig((prev) => ({ ...prev, gameMode: 'ai-medium' }));
                  setState(STATES.CONFIGURE_GAME);
                }}>
                  Medium
                </button>
                <button type="button" className={panelButton} onClick={() => {
                  setConfig((prev) => ({ ...prev, gameMode: 'ai-hard' }));
                  setState(STATES.CONFIGURE_GAME);
                }}>
                  Hard
                </button>
                <button type="button" className={panelButton} onClick={() => setState(STATES.SELECT_MODE)}>Back</button>
              </PlayPanel>
            )}

            {state === STATES.MULTIPLAYER_MENU && hasCredentials && (
              <PlayPanel title="Multiplayer" subtitle="Choose a mode">
                <button type="button" className={panelButton} onClick={() => setState(STATES.ONLINE_LOBBY)}>
                  Online PVP
                </button>
                <button type="button" className={panelButton} onClick={() => {
                  setConfig((prev) => ({ ...prev, gameMode: 'local-2p' }));
                  setState(STATES.LOCAL_P1_SETUP);
                }}>
                  Local PVP
                </button>
                <button type="button" className={panelButton} onClick={() => setState(STATES.SELECT_MODE)}>Back</button>
              </PlayPanel>
            )}

            {state === STATES.ONLINE_LOBBY && (
              <PlayPanel title="Online" subtitle="Multiplayer lobby">
                <button type="button" className={panelButton} onClick={() => {
                  setConfig((prev) => ({
                    ...prev,
                    playerName: user?.nickname || prev.playerName || 'Player 1',
                    gameMode: 'online-create',
                  }));
                  setState(STATES.CONFIGURE_GAME);
                }}>
                  Create room
                </button>
                <button type="button" className={panelButton} onClick={() => {
                  refreshRooms();
                  setState(STATES.ONLINE_JOIN_ROOM);
                }}>
                  Join room
                </button>
                <button type="button" className={panelButton} onClick={() => setState(STATES.MULTIPLAYER_MENU)}>Back</button>
              </PlayPanel>
            )}

            {state === STATES.ONLINE_JOIN_ROOM && (
              <PlayPanel title="Rooms" subtitle="Choose an available room">
                <button type="button" className={panelButton} onClick={refreshRooms} disabled={loadingRooms}>
                  {loadingRooms ? 'Loading...' : 'Refresh'}
                </button>
                {roomError && <p className="text-sm font-semibold text-red-600">{roomError}</p>}
                {rooms.length === 0 && !loadingRooms && <p className="text-sm text-slate-700">No rooms available</p>}
                {rooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between rounded-xl border border-slate-500 bg-white/70 px-3 py-2">
                    <span className="text-sm font-medium">{room.creatorName ? `${room.creatorName}'s room` : room.name}</span>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-700 px-3 py-1 text-sm font-semibold hover:bg-slate-100"
                      onClick={() => {
                        setConfig((prev) => ({ ...prev, gameMode: 'online-join', roomId: room.id }));
                        setState(STATES.CONFIGURE_GAME);
                      }}
                    >
                      Join
                    </button>
                  </div>
                ))}
                <button type="button" className={panelButton} onClick={() => setState(STATES.ONLINE_LOBBY)}>Back</button>
              </PlayPanel>
            )}

            {state === STATES.ONLINE_WAITING && (
              <PlayPanel title="Online" subtitle="Waiting for opponent...">
                <button type="button" className={panelButton} onClick={() => setState(STATES.ONLINE_LOBBY)}>
                  Cancel
                </button>
              </PlayPanel>
            )}

            {state === STATES.CONFIGURE_GAME && (
              <PlayPanel title="Setup" subtitle="Configure your match">
                {user?.nickname ? (
                  <p className="rounded-xl border border-slate-500 bg-white/70 px-4 py-3 text-sm">Name: <strong>{user.nickname}</strong></p>
                ) : (
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                    Name
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={config.playerName || ''}
                      onChange={(e) => setConfig((prev) => ({ ...prev, playerName: e.target.value }))}
                      className="rounded-xl border border-slate-500 bg-white px-4 py-3 text-base font-medium text-slate-900"
                    />
                  </label>
                )}
                {config.gameMode !== 'online-join' && (
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                    Points to win
                    <select
                      value={config.winningScore}
                      onChange={(e) => setConfig((prev) => ({ ...prev, winningScore: Number(e.target.value) }))}
                      className="rounded-xl border border-slate-500 bg-white px-4 py-3 text-base font-medium text-slate-900"
                    >
                      <option value={3}>3</option>
                      <option value={5}>5</option>
                      <option value={7}>7</option>
                      <option value={9}>9</option>
                      <option value={11}>11</option>
                    </select>
                  </label>
                )}
                <ColorPicker
                  selectedColor={config.playerColor}
                  onColorSelect={(hex) => setConfig((prev) => ({ ...prev, playerColor: hex }))}
                  label="Paddle color"
                />
                <button
                  type="button"
                  className={panelButton}
                  onClick={() => {
                    const finalConfig = { ...config, playerName: config.playerName || 'Player 1' };
                    if (finalConfig.gameMode === 'online-create') {
                      setConfig(finalConfig);
                      setState(STATES.ONLINE_WAITING);
                    } else {
                      startLoadingWithConfig(finalConfig);
                    }
                  }}
                >
                  {config.gameMode === 'online-create' ? 'Create & Wait' : 'Play'}
                </button>
                <button
                  type="button"
                  className={panelButton}
                  onClick={() => {
                    if (config.gameMode.startsWith('ai-')) setState(STATES.AI_SELECT_DIFFICULTY);
                    else if (config.gameMode === 'online-create') setState(STATES.ONLINE_LOBBY);
                    else if (config.gameMode === 'online-join') setState(STATES.ONLINE_JOIN_ROOM);
                    else setState(STATES.ONLINE_LOBBY);
                  }}
                >
                  Back
                </button>
              </PlayPanel>
            )}

            {state === STATES.LOCAL_P1_SETUP && (
              <PlayPanel title="Player 1" subtitle="Local match setup">
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                  Name
                  <input
                    type="text"
                    value={config.playerName || ''}
                    onChange={(e) => setConfig((prev) => ({ ...prev, playerName: e.target.value }))}
                    className="rounded-xl border border-slate-500 bg-white px-4 py-3 text-base font-medium text-slate-900"
                  />
                </label>
                <ColorPicker
                  selectedColor={config.playerColor}
                  onColorSelect={(hex) => setConfig((prev) => ({ ...prev, playerColor: hex }))}
                  label="Paddle color"
                />
                <button
                  type="button"
                  className={panelButton}
                  onClick={() => {
                    setConfig((prev) => ({ ...prev, playerName: prev.playerName || 'Player 1' }));
                    setState(STATES.LOCAL_P2_SETUP);
                  }}
                >
                  Next
                </button>
                <button type="button" className={panelButton} onClick={() => setState(STATES.SELECT_MODE)}>
                  Back
                </button>
              </PlayPanel>
            )}

            {state === STATES.LOCAL_P2_SETUP && (
              <PlayPanel title="Player 2" subtitle="Local match setup">
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                  Name
                  <input
                    type="text"
                    value={config.player2Name || ''}
                    onChange={(e) => setConfig((prev) => ({ ...prev, player2Name: e.target.value }))}
                    className="rounded-xl border border-slate-500 bg-white px-4 py-3 text-base font-medium text-slate-900"
                  />
                </label>
                <ColorPicker
                  selectedColor={config.player2Color || '#F6511D'}
                  onColorSelect={(hex) => setConfig((prev) => ({ ...prev, player2Color: hex }))}
                  label="Paddle color"
                />
                <button
                  type="button"
                  className={panelButton}
                  onClick={() => {
                    const finalConfig = {
                      ...config,
                      player2Name: config.player2Name || 'Player 2',
                      player2Color: config.player2Color || '#F6511D',
                    };
                    setConfig(finalConfig);
                    startLoadingWithConfig(finalConfig);
                  }}
                >
                  Play
                </button>
                <button type="button" className={panelButton} onClick={() => setState(STATES.LOCAL_P1_SETUP)}>
                  Back
                </button>
              </PlayPanel>
            )}
          </div>
        </section>

        <div className="pt-4 text-slate-800">
          <FooterTermsPolicy />
        </div>
      </div>
    </main>
  );
}
