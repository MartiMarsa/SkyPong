'use client';

import { Avatar, StatCard } from '../base';
import { useTranslation } from '../../context/language-context';
import AddFriendButton from './AddFriendButton'
import { useAuth } from '../../context/auth-context';

interface PlayerStats {
  wins: number;
  losses: number;
  winrate: number;
  played: number;
}

interface PlayerProfile {
  id: string;
  nickname: string;
  winPhrase?: string;
  avatarUrl?: string;
  stats?: PlayerStats;
}

interface PlayerInfoProps {
  profile: PlayerProfile;
  csrfToken: string;
}

export default function PlayerInfo({ profile, csrfToken }: PlayerInfoProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Calculate stats
  const wins = profile?.stats?.wins || 0;
  const losses = profile?.stats?.losses || 0;
  const totalGames = profile?.stats?.played || wins + losses;
  const winRate = profile?.stats?.winrate 
    ? Math.round(profile.stats.winrate)
    : totalGames > 0 
      ? Math.round((wins / totalGames) * 100)
      : 0;

  return (
    <>
      {/* Profile Header */}
      <section className="profile-header">
        <Avatar 
          size="lg" 
          src={profile?.avatarUrl || '/avatar/default-avatar.webp'} 
          fallbackText={profile?.nickname || 'Player'}
        />
        <div className="profile-identity">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900">
            {profile?.nickname || 'Player'}
          </h2>
          {profile?.winPhrase && (
            <p className="text-sm md:text-base text-muted mt-1">
              {profile.winPhrase}
            </p>
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <div className="profile-stats-grid">
        <StatCard 
          label={t.profile.stats.totalGames}
          value={totalGames.toString()}
          icon="🎮"
          variant="default"
        />
        <StatCard 
          label={t.profile.stats.winRate}
          value={`${winRate}%`}
          icon="📊"
          variant={winRate >= 50 ? "success" : "default"}
          trend={winRate >= 50 ? "up" : winRate > 0 ? "down" : "neutral"}
          trendValue={`${winRate}%`}
        />
        <StatCard 
          label={t.player.wins}
          value={wins.toString()}
          icon="🏆"
          variant="success"
        />
        <StatCard 
          label={t.player.losses}
          value={losses.toString()}
          icon="💔"
          variant="danger"
        />
      </div>
      { user.id !== profile.id ? (<div className="">
        <AddFriendButton currentUserId={user?.id} targetId={profile.id} csrfToken={csrfToken} />
      </div>) : ("") }
    </>
  );
}
