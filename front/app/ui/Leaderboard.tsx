'use client';

import { useEffect, useState, useCallback } from 'react';

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
  players: PlayerStat[];
}

const POLL_INTERVAL = 30_000; // 30s

function useLeaderboard() {
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [lastSync, setLastSync] = useState<string>('2025-12-01');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const getCsrfToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf_token='))
            ?.split('=')[1];
    };
    const fetchUpdates = useCallback(async (since: string) => {
        try {
            const csrfToken = getCsrfToken();
            const res = await fetch(
                `/api/statistics/leaderboard`,{
                credentials: 'include',
                }
        );
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const data: LeaderboardResponse = await res.json();

        console.log("Num players: ", data.liderboard);
        console.info("Statistics data: ", data);
      if (data.liderboard.length > 0) {
        setPlayers(prev => {
          const map = new Map(prev.map(p => [p.user_id, p]));
          for (const p of data.liderboard) map.set(p.user_id, p);
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
    <div className="lb-bars" aria-label={`${wins} wins, ${losses} losses`}>
      <div
        className="lb-bar lb-bar--win"
        style={{ height: total === 0 ? '8px' : `${Math.max(8, winPct * 0.48)}px` }}
        title={`Wins: ${wins}`}
      />
      <div
        className="lb-bar lb-bar--loss"
        style={{ height: total === 0 ? '8px' : `${Math.max(8, (100 - winPct) * 0.48)}px` }}
        title={`Losses: ${losses}`}
      />
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  idle: '#a3a3a3',
};

function statusDot(rate: number) {
  // Simple heuristic: active recently = online
  return rate > 0 ? STATUS_COLORS.online : STATUS_COLORS.idle;
}

function LeaderboardRow({
  player,
  rank,
}: {
  player: PlayerStat;
  rank: number;
}) {
  return (
    <div className="lb-row">
      <span className="lb-rank">{rank}.</span>
      <div className="lb-info">
        <div className="lb-name-row">
          <span className="lb-name">{player.user_id}</span>
          <span
            className="lb-dot"
            style={{ background: statusDot(player.rate) }}
          />
        </div>
        <span className="lb-sub">Total games: {player.played}</span>
        <span className="lb-sub">
          Win rate:{' '}
          {player.winrate != null ? `${Math.round(player.winrate)}%` : '—'}
        </span>
      </div>
      <WinLossBar wins={player.wins} losses={player.losses} />
    </div>
  );
}

export default function Leaderboard() {
  const { players, loading, error } = useLeaderboard();

  return (
    <>
      <style>{`
        .lb-wrap {
          max-width: 400px;
          margin: 0 auto;
          padding: 24px 16px;
          font-family: sans-serif;
        }
        .lb-title {
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 20px;
        }
        .lb-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .lb-row {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 2px solid #1a1a1a;
          border-radius: 12px;
          padding: 12px 14px;
        }
        .lb-rank {
          font-size: 1.1rem;
          font-weight: 700;
          min-width: 24px;
        }
        .lb-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lb-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .lb-name {
          font-size: 1rem;
          font-weight: 600;
        }
        .lb-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .lb-sub {
          font-size: 0.8rem;
          color: #555;
        }
        .lb-bars {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 48px;
        }
        .lb-bar {
          width: 18px;
          border-radius: 3px;
          transition: height 0.4s ease;
        }
        .lb-bar--win  { background: transparent; border: 2px solid #22c55e; }
        .lb-bar--loss { background: transparent; border: 2px solid #ef4444; }
        .lb-empty {
          text-align: center;
          color: #888;
          padding: 32px 0;
        }
      `}</style>

      <div className="lb-wrap">
        <h1 className="lb-title">Leaderboard</h1>

        {loading && <p className="lb-empty">Loading…</p>}
        {error && <p className="lb-empty">Error: {error}</p>}

        {!loading && !error && players.length === 0 && (
          <p className="lb-empty">No players yet.</p>
        )}

        <div className="lb-list">
          {players.map((p, i) => (
            <LeaderboardRow key={p.user_id} player={p} rank={i + 1} />
          ))}
        </div>
      </div>
    </>
  );
}
