'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from './base';
import { useTranslation } from '../context/language-context';
import { useRouter } from 'next/navigation';

interface PlayerStat {
  user_id: string;
  played: number;
  wins: number;
  losses: number;
  winrate: number;
  rate: number;
  updated_at: string;
}

interface LeaderboardResponse {
  last: string;
  leaderboard: PlayerStat[];
}

const POLL_INTERVAL = 30_000; // 30s

function useLeaderboard() {
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [lastSync, setLastSync] = useState<string>('2025-12-01');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdates = useCallback(async (since: string) => {
    try {
      const res = await fetch(`/api/statistics/leaderboard`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data: LeaderboardResponse = await res.json();

      if (data.leaderboard.length > 0) {
        setPlayers(prev => {
          const map = new Map(prev.map(p => [p.user_id, p]));
          for (const p of data.leaderboard) map.set(p.user_id, p);
          return Array.from(map.values()).sort((a, b) => b.rate - a.rate);
        });
        setLastSync(data.last);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpdates(lastSync);
  }, []); // initial load

  useEffect(() => {
    const id = setInterval(() => fetchUpdates(lastSync), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [lastSync, fetchUpdates]);

  return { players, loading, error };
}

function WinLossBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  const winPct = total === 0 ? 0 : Math.round((wins / total) * 100);

  return (
    <div className="leaderboard-bars" aria-label={`${wins} wins, ${losses} losses`}>
      <div
        className="leaderboard-bar leaderboard-bar-win"
        style={{ height: total === 0 ? '8px' : `${Math.max(8, winPct * 0.48)}px` }}
        title={`Wins: ${wins}`}
      />
      <div
        className="leaderboard-bar leaderboard-bar-loss"
        style={{ height: total === 0 ? '8px' : `${Math.max(8, (100 - winPct) * 0.48)}px` }}
        title={`Losses: ${losses}`}
      />
    </div>
  );
}

function LeaderboardRow({
  player,
  rank,
}: {
  player: PlayerStat;
  rank: number;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  
  const isOnline = player.rate > 0;

  const handleRowClick = () => {
    router.push(`/${player.user_id}`);
  };

  return (
    <div 
      className="leaderboard-row cursor-pointer" 
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
    >
      <span className="leaderboard-rank">{rank}.</span>
      <div className="leaderboard-info">
        <div className="leaderboard-name">
          <span className="font-semibold text-sm md:text-base">{player.user_id}</span>
          <Badge 
            size="sm" 
            variant={isOnline ? "success" : "neutral"}
            shape="pill"
          >
            {isOnline ? t.profile.leaderboard.online : t.profile.leaderboard.idle}
          </Badge>
        </div>
        <span className="text-xs text-muted">
          {t.profile.leaderboard.totalGames} {player.played}
        </span>
        <span className="text-xs text-muted">
          {t.player.winRate}:{' '}
          {player.winrate != null ? `${Math.round(player.winrate)}%` : '—'}
        </span>
      </div>
      <WinLossBar wins={player.wins} losses={player.losses} />
    </div>
  );
}

export default function Leaderboard() {
  const { t } = useTranslation();
  const { players, loading, error } = useLeaderboard();

  return (
    <div className="space-y-3">
      {loading && (
        <p className="text-muted text-sm text-center py-8">
          {t.profile.leaderboard.loading}
        </p>
      )}
      {error && (
        <p className="text-danger text-sm text-center py-8">
          Error: {error}
        </p>
      )}
      {!loading && !error && players.length === 0 && (
        <p className="text-muted text-sm text-center py-8">
          {t.profile.leaderboard.noPlayers}
        </p>
      )}
      {players.map((p, i) => (
        <LeaderboardRow key={p.user_id} player={p} rank={i + 1} />
      ))}
    </div>
  );
}
