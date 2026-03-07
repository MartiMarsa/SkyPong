/**
 * AchievementsSection
 * 
 * Props:
 *   stats: { wins: number, losses: number, winrate: number }
 * 
 * Usage:
 *   <AchievementsSection stats={player.stats} />
 */

'use client';

import { useMemo } from "react";
import { useTranslation } from "../../context/language-context";
import { ProgressBar, Badge } from "../base";
import { cn } from "@/lib/utils";

// ─── Achievement unlock logic ────────────────────────────────────────────────
function computeAchievements(stats: any, t: any) {
  if (!t?.achievements?.logAchievements) return [];

  const wins = stats?.wins ?? 0;
  const losses = stats?.losses ?? 0;
  const rate = stats?.winrate ?? 0;
  const totalGames = wins + losses;

  return [
    // ── Login achievements ──────────────────────────────────────────────────
    {
      id: "firstLogin",
      category: "log",
      icon: "🎮",
      title: t.achievements.logAchievements.firstLogin,
      description: t.achievements.logAchievements.firstLoginDesc,
      unlocked: true, // Always unlocked — if you're here, you logged in
    },
    {
      id: "login7Days",
      category: "log",
      icon: "📅",
      title: t.achievements.logAchievements.login7Days,
      description: t.achievements.logAchievements.login7DaysDesc,
      unlocked: false, // needs backend streak data — locked by default
      comingSoon: true,
    },
    {
      id: "login30Days",
      category: "log",
      icon: "🏅",
      title: t.achievements.logAchievements.login30Days,
      description: t.achievements.logAchievements.login30DaysDesc,
      unlocked: false,
      comingSoon: true,
    },

    // ── Win achievements ────────────────────────────────────────────────────
    {
      id: "firstWin",
      category: "win",
      icon: "⚡",
      title: t.achievements.winAchievements.firstWin,
      description: t.achievements.winAchievements.firstWinDesc,
      unlocked: wins >= 1,
    },
    {
      id: "win10Games",
      category: "win",
      icon: "🔥",
      title: t.achievements.winAchievements.win10Games,
      description: t.achievements.winAchievements.win10GamesDesc,
      unlocked: wins >= 10,
      progress: Math.min(wins, 10),
      goal: 10,
    },
    {
      id: "win100Games",
      category: "win",
      icon: "👑",
      title: t.achievements.winAchievements.win100Games,
      description: t.achievements.winAchievements.win100GamesDesc,
      unlocked: wins >= 100,
      progress: Math.min(wins, 100),
      goal: 100,
    },

    // ── Won games achievements ──────────────────────────────────────────────
    {
      id: "firstGame",
      category: "games",
      icon: "🕹️",
      title: t.achievements.wonGamesAchievements.firsgame,
      description: t.achievements.wonGamesAchievements.firsgameDesc,
      unlocked: totalGames >= 1,
    },
    {
      id: "win5Games",
      category: "games",
      icon: "🎯",
      title: t.achievements.wonGamesAchievements.win5Games,
      description: t.achievements.wonGamesAchievements.win5GamesDesc,
      unlocked: wins >= 5,
      progress: Math.min(wins, 5),
      goal: 5,
    },
    {
      id: "win50Games",
      category: "games",
      icon: "⚔️",
      title: t.achievements.wonGamesAchievements.win50Games,
      description: t.achievements.wonGamesAchievements.win50GamesDesc,
      unlocked: wins >= 50,
      progress: Math.min(wins, 50),
      goal: 50,
    },
    {
      id: "win500Games",
      category: "games",
      icon: "🌟",
      title: t.achievements.wonGamesAchievements.win500Games,
      description: t.achievements.wonGamesAchievements.win500GamesDesc,
      unlocked: wins >= 500,
      progress: Math.min(wins, 500),
      goal: 500,
    },
  ];
}

// ─── Single achievement card ──────────────────────────────────────────────────
function AchievementCard({ achievement }: { achievement: any }) {
  const { icon, title, description, unlocked, comingSoon, progress, goal } = achievement;
  const hasProgress = progress !== undefined && goal !== undefined;

  return (
    <div
      className={cn(
        'achievement-card',
        unlocked ? 'achievement-unlocked' : 'achievement-locked'
      )}
    >
      {/* Icon */}
      <div className="achievement-icon">
        {icon}
      </div>

      {/* Content */}
      <div className="achievement-content">
        <h4 className="text-sm md:text-base font-semibold font-display text-gray-900 mb-1">
          {title}
        </h4>
        <p className="text-xs md:text-sm text-muted mb-3">
          {description}
        </p>

        {/* Progress bar for achievements with progress */}
        {hasProgress && (
          <div className="achievement-progress">
            <ProgressBar
              value={progress}
              max={goal}
              color={unlocked ? "success" : "neutral"}
              size="sm"
              label={`${progress}/${goal}`}
              showLabel
              showPercentage
            />
          </div>
        )}

        {/* Coming soon badge */}
        {comingSoon && (
          <div className="mt-2">
            <Badge size="sm" variant="info">
              Coming Soon
            </Badge>
          </div>
        )}

        {/* Lock indicator for locked achievements */}
        {!unlocked && !comingSoon && (
          <div className="absolute top-3 right-3 text-gray-400 text-sm">
            🔒
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AchievementsSection({ stats }: { stats: any }) {
  const { t } = useTranslation();
  const achievements = useMemo(() => computeAchievements(stats, t), [stats, t]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
}
