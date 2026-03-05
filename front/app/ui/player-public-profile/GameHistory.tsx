'use client';

import { useEffect, useState } from 'react';
import Loader from '../loader/loader-ui';

interface PlayerGamesHistoryData {
  id: string;
  nickname: string;
  avatar: string | null;
  points: number;
  session_expires_at: string | null;
  last_access: string | null;
  logged: number;
}

interface AIGamesHistoryData {
  id: string;
  nickname: string;
  avatar: string | null;
  points: number;
  session_expires_at: null;
  last_access: null;
  logged: number;
}

interface GameHistoryItem {
  gameId: string;
  gameMode: 'ai' | 'remote-pvp';
  gameDate: string;
  player1: PlayerGamesHistoryData | AIGamesHistoryData;
  player2: PlayerGamesHistoryData | AIGamesHistoryData;
  winner: number; // 1 = player1, 2 = player2
}

function useGameHistory(userId: string) {
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/profile/game-history/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch game history');
        return res.json();
      })
      .then(setGames)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return { games, loading, error };
}

function GameRow({ game, userId }: { game: GameHistoryItem; userId: string }) {
  const isPlayer1 = game.player1.id === userId;
  const me = isPlayer1 ? game.player1 : game.player2;
  const opponent = isPlayer1 ? game.player2 : game.player1;
  const myNumber = isPlayer1 ? 0 : 1;
  const won = game.winner === myNumber;
  const draw = game.player1.points === game.player2.points;

  const result = draw ? 'draw' : won ? 'win' : 'loss';
  const resultColor = { win: '#22c55e', loss: '#ef4444', draw: '#a3a3a3' }[result];

  const date = new Date(game.gameDate.replace(' ', 'T') + 'Z');
  const dateStr = date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', border: '1.5px solid #e5e5e5', borderRadius: '10px' }}>
        {/* Result */}
        <span style={{ fontSize: '11px', fontWeight: 700, color: resultColor, minWidth: '32px', textTransform: 'uppercase' }}>
            {result}
        </span>

        {/* Players */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <img style={{ borderRadius: '50%', border: '1px solid #e1e1e1', maxWith: '32px', maxHeight: '32px', aspectRatio: '1 / 1' }} src={me.avatar} />
            <span style={{ fontWeight: 600 }}>{me.nickname}</span>
            <span style={{ color: '#a3a3a3' }}>{me.points}</span>
            <span style={{ color: '#a3a3a3' }}>vs</span>
            { console.info("Opponent Avatar: ", opponent.avatar)}
            <img style={{ borderRadius: '50%', border: '1px solid #e1e1e1', maxWith: '32px', maxHeight: '32px', aspectRatio: '1 / 1' }} src={opponent.avatar || '/avatar/default-avatar.webp'} />
            <span style={{ fontWeight: 600 }}>{opponent.nickname}</span>
            <span style={{ color: '#a3a3a3' }}>{opponent.points}</span>
        </div>

        {/* Mode */}
        <span style={{ fontSize: '11px', color: '#a3a3a3', minWidth: '60px', textAlign: 'center' }}>
            {game.gameMode === 'ai' ? 'vs AI' : 'PvP'}
        </span>

        {/* Date */}
        <span style={{ fontSize: '11px', color: '#a3a3a3', textAlign: 'right' }}>
            {dateStr}<br />{timeStr}
        </span>
        </div>
    </>
  );
}

interface GameHistoryProps {
  userId: string;
}

export default function GameHistory({ userId }: GameHistoryProps) {
  const { games, loading, error } = useGameHistory(userId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {loading && <Loader classes="" message="Loading..." />}
      {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>Error: {error}</p>}
      {!loading && !error && games.length === 0 && (
        <p style={{ color: '#a3a3a3', fontSize: '13px' }}>No games yet.</p>
      )}
      {games.map(game => (
        <GameRow key={game.gameId} game={game} userId={userId} />
      ))}
    </div>
  );
}
