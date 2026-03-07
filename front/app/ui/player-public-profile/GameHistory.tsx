'use client';

import { useEffect, useState } from 'react';
import { Card, Avatar, Chip, Badge } from '../base';
import { useTranslation } from '../../context/language-context';
import Loader from '../loader/loader-ui';
import Link from "next/link";
import { isMe } from '../../lib/players/whois';
import { useAuth } from '../../context/auth-context';

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
  winner: number; // 0 = player1, 1 = player2
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

function getPlayerLink(profileId : string, playerId : string, nickname : string)
{
    const {user} = useAuth();


    if (playerId === profileId || isMe(playerId, user.id))
        return nickname;
    else
        return (<Link href={`/${playerId}`}>{nickname}</Link>);
}

function GameRow({ game, profileId }: { game: GameHistoryItem; profileId: string }) {
  const { t } = useTranslation();
  
  const isPlayer1 = game.player1.id === profileId;
  const me = isPlayer1 ? game.player1 : game.player2;
  const opponent = isPlayer1 ? game.player2 : game.player1;
  const myNumber = isPlayer1 ? 0 : 1;
  const won = game.winner === myNumber;
  const draw = game.player1.points === game.player2.points;

  const result = draw ? 'draw' : won ? 'win' : 'loss';
  const resultVariant = { win: 'success', loss: 'error', draw: 'default' }[result] as 'success' | 'error' | 'default';

  const date = new Date(game.gameDate.replace(' ', 'T'));
  const dateStr = date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="game-row">
      {/* Result chip */}
      <Chip variant={resultVariant} className="min-w-[4rem] text-center">
        {t.profile.gameHistory[result]}
      </Chip>

      {/* Players */}
      <div className="game-players">
        <Avatar size="sm" src={me.avatar || '/avatar/default-avatar.webp'} fallbackText={me.nickname} />
        <span className="font-semibold text-sm md:text-base">{getPlayerLink(profileId, me.id, me.nickname)}</span>
        <span className="text-muted text-sm">{me.points}</span>
        <span className="text-muted text-sm">vs</span>
        <Avatar size="sm" src={opponent.avatar || '/avatar/default-avatar.webp'} fallbackText={opponent.nickname} />
        <span className="font-semibold text-sm md:text-base">{getPlayerLink(profileId, opponent.id, opponent.nickname)}</span>
        <span className="text-muted text-sm">{opponent.points}</span>
      </div>

      {/* Mode badge */}
      <Badge size="sm" variant="neutral" className="min-w-[3.5rem] text-center">
        {game.gameMode === 'ai' ? t.profile.gameHistory.vsAI : t.profile.gameHistory.pvp}
      </Badge>

      {/* Date & time */}
      <span className="text-xs text-muted text-right whitespace-nowrap">
        {dateStr}<br />{timeStr}
      </span>
    </div>
  );
}

interface GameHistoryProps {
  userId: string;
}

export default function GameHistory({ userId }: GameHistoryProps) {
  const { t } = useTranslation();
  const { games, loading, error } = useGameHistory(userId);

  return (
    <div className="space-y-3">
      {loading && <Loader classes="" message={t.profile.gameHistory.loading} />}
      {error && (
        <p className="text-danger text-sm">
          {t.profile.gameHistory.error} {error}
        </p>
      )}
      {!loading && !error && games.length === 0 && (
        <p className="text-muted text-sm text-center py-8">
          {t.profile.gameHistory.noGames}
        </p>
      )}
      {games.map(game => (
        <GameRow key={game.gameId} game={game} userId={userId} />
      ))}
    </div>
  );
}
