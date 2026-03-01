'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { encodeConfig } from '../lib/game/game-session-config';
import { getAvailableRooms } from '../lib/game/room-service';
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

function ColorPicker({ selectedColor, onColorSelect, label }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '5px' }}>{label}</label>
      <div style={{ display: 'flex', gap: '10px' }}>
        {PLAYER_COLORS.map((color) => (
          <button
            key={color.hex}
            type="button"
            onClick={() => onColorSelect(color.hex)}
            title={color.name}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: color.hex,
              border: selectedColor === color.hex ? '3px solid white' : '2px solid transparent',
              boxShadow: selectedColor === color.hex ? `0 0 8px ${color.hex}` : 'none',
              cursor: 'pointer',
              padding: 0,
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      zIndex: 1000,
    }}>
      <iframe
        ref={iframeRef}
        src={gameUrl}
        title="Game"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="cross-origin-isolated"
      />
    </div>
  );
}

export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState(STATES.SELECT_MODE);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomError, setRoomError] = useState(null);
  const [gameUrl, setGameUrl] = useState('');

  const { user, hasCredentials } = useAuth();
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
      <main>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1>Loading...</h1>
        </div>
      </main>
    );
  }

  if (state === STATES.PLAYING && gameUrl) {
    return <GameOverlay gameUrl={gameUrl} onExit={handleGameExit} />;
  }

  return (
    <main style={{ padding: '20px' }}>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {state === STATES.SELECT_MODE && (
        <section>
          <h1>Choose your game mode</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <button type="button" onClick={() => {
              setConfig((prev) => ({ ...prev, gameMode: 'ai-easy' }));
              setState(STATES.AI_SELECT_DIFFICULTY);
            }}>
              1 vs AI
            </button>
            {hasCredentials && (
              <button type="button" onClick={() => setState(STATES.MULTIPLAYER_MENU)}>
                Multiplayer
              </button>
            )}
          </div>
        </section>
      )}

      {state === STATES.AI_SELECT_DIFFICULTY && (
        <section>
          <h1>Select Difficulty</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <button type="button" onClick={() => {
              setConfig((prev) => ({ ...prev, gameMode: 'ai-easy' }));
              setState(STATES.CONFIGURE_GAME);
            }}>
              Easy
            </button>
            <button type="button" onClick={() => {
              setConfig((prev) => ({ ...prev, gameMode: 'ai-medium' }));
              setState(STATES.CONFIGURE_GAME);
            }}>
              Medium
            </button>
            <button type="button" onClick={() => {
              setConfig((prev) => ({ ...prev, gameMode: 'ai-hard' }));
              setState(STATES.CONFIGURE_GAME);
            }}>
              Hard
            </button>
            <button type="button" onClick={() => setState(STATES.SELECT_MODE)}>
              Back
            </button>
          </div>
        </section>
      )}

      {state === STATES.MULTIPLAYER_MENU && hasCredentials && (
        <section>
          <h1>Multiplayer</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <button type="button" onClick={() => setState(STATES.ONLINE_LOBBY)}>
              Online PVP
            </button>
            <button type="button" onClick={() => {
              setConfig((prev) => ({ ...prev, gameMode: 'local-2p' }));
              setState(STATES.LOCAL_P1_SETUP);
            }}>
              Local PVP
            </button>
            <button type="button" onClick={() => setState(STATES.SELECT_MODE)}>
              Back
            </button>
          </div>
        </section>
      )}

      {state === STATES.ONLINE_LOBBY && (
        <section>
          <h1>Online Multiplayer</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <button type="button" onClick={() => {
              setConfig((prev) => ({
                ...prev,
                playerName: user?.nickname || prev.playerName || 'Player 1',
                gameMode: 'online-create',
              }));
              setState(STATES.CONFIGURE_GAME);
            }}>
              Create room
            </button>
            <button type="button" onClick={() => {
              refreshRooms();
              setState(STATES.ONLINE_JOIN_ROOM);
            }}>
              Join room
            </button>
            <button type="button" onClick={() => setState(STATES.MULTIPLAYER_MENU)}>
              Back
            </button>
          </div>
        </section>
      )}


      {state === STATES.ONLINE_JOIN_ROOM && (
        <section>
          <h1>Room List</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <button type="button" onClick={refreshRooms} disabled={loadingRooms}>
              {loadingRooms ? 'Loading...' : 'Refresh'}
            </button>
            {roomError && <p style={{ color: 'red' }}>{roomError}</p>}
            {rooms.length === 0 && !loadingRooms && <p>No rooms available</p>}
            {rooms.map((room) => (
              <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #ccc' }}>
                <span>{room.creatorName ? `${room.creatorName}'s room` : room.name}</span>
                <button type="button" onClick={() => {
                  setConfig((prev) => ({ ...prev, gameMode: 'online-join', roomId: room.id }));
                  setState(STATES.CONFIGURE_GAME);
                }}>
                  Join
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setState(STATES.ONLINE_LOBBY)}>
              Back
            </button>
          </div>
        </section>
      )}

      {state === STATES.ONLINE_WAITING && (
        <section>
          <h1>Waiting for opponent...</h1>
          <button type="button" onClick={() => {
            setState(STATES.ONLINE_LOBBY);
          }}>
            Cancel
          </button>
        </section>
      )}

      {state === STATES.CONFIGURE_GAME && (
        <section>
          <h1>Configure Game</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            {user?.nickname ? (
              <p style={{ margin: 0 }}>Name: <strong>{user.nickname}</strong></p>
            ) : (
              <label>
                Name:
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={config.playerName || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, playerName: e.target.value }))}
                  style={{ padding: '10px', fontSize: '16px', width: '100%' }}
                />
              </label>
            )}
            {config.gameMode !== 'online-join' && (
              <label>
                Points to win:
                <select
                  value={config.winningScore}
                  onChange={(e) => setConfig((prev) => ({ ...prev, winningScore: Number(e.target.value) }))}
                  style={{ padding: '10px', fontSize: '16px', width: '100%' }}
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
              label="Paddle color:"
            />
            <button type="button" onClick={() => {
              const finalConfig = { ...config, playerName: config.playerName || 'Player 1' };
              if (finalConfig.gameMode === 'online-create') {
                setConfig(finalConfig);
                setState(STATES.ONLINE_WAITING);
              } else {
                startLoadingWithConfig(finalConfig);
              }
            }}>
              {config.gameMode === 'online-create' ? 'Create & Wait' : 'Play'}
            </button>
            <button type="button" onClick={() => {
              if (config.gameMode.startsWith('ai-')) setState(STATES.AI_SELECT_DIFFICULTY);
              else if (config.gameMode === 'online-create') setState(STATES.ONLINE_LOBBY);
              else if (config.gameMode === 'online-join') setState(STATES.ONLINE_JOIN_ROOM);
              else setState(STATES.ONLINE_LOBBY);
            }}>
              Back
            </button>
          </div>
        </section>
      )}

      {state === STATES.LOCAL_P1_SETUP && (
        <section>
          <h1>Player 1 Setup</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <label>
              Name:
              <input
                type="text"
                value={config.playerName || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, playerName: e.target.value }))}
                style={{ padding: '10px', fontSize: '16px' }}
              />
            </label>
            <ColorPicker
              selectedColor={config.playerColor}
              onColorSelect={(hex) => setConfig((prev) => ({ ...prev, playerColor: hex }))}
              label="Paddle color:"
            />
            <button type="button" onClick={() => {
              setConfig((prev) => ({ ...prev, playerName: prev.playerName || 'Player 1' }));
              setState(STATES.LOCAL_P2_SETUP);
            }}>
              Next
            </button>
            <button type="button" onClick={() => setState(STATES.MULTIPLAYER_MENU)}>
              Back
            </button>
          </div>
        </section>
      )}

      {state === STATES.LOCAL_P2_SETUP && (
        <section>
          <h1>Player 2 Setup</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <label>
              Name:
              <input
                type="text"
                value={config.player2Name || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, player2Name: e.target.value }))}
                style={{ padding: '10px', fontSize: '16px' }}
              />
            </label>
            <ColorPicker
              selectedColor={config.player2Color || '#F6511D'}
              onColorSelect={(hex) => setConfig((prev) => ({ ...prev, player2Color: hex }))}
              label="Paddle color:"
            />
            <button type="button" onClick={() => {
              const finalConfig = {
                ...config,
                player2Name: config.player2Name || 'Player 2',
                player2Color: config.player2Color || '#F6511D',
              };
              setConfig(finalConfig);
              startLoadingWithConfig(finalConfig);
            }}>
              Play
            </button>
            <button type="button" onClick={() => setState(STATES.LOCAL_P1_SETUP)}>
              Back
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
