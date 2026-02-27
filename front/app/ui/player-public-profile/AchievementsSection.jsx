/**
 * AchievementsSection
 * 
 * Props:
 *   stats: { wins: number, losses: number, rate: number }
 *   t: translation object (with t.achievements structure)
 * 
 * Usage:
 *   <AchievementsSection stats={player.stats} t={t} />
 */

import { useMemo } from "react";

// ─── Achievement unlock logic ────────────────────────────────────────────────
function computeAchievements(stats, t) {
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
function AchievementCard({ achievement }) {
  const { icon, title, description, unlocked, comingSoon, progress, goal } = achievement;
  const hasProgress = progress !== undefined && goal !== undefined;
  const pct = hasProgress ? Math.round((progress / goal) * 100) : 0;

  return (
    <div
      style={{
        position: "relative",
        background: unlocked
          ? "linear-gradient(135deg, #0f1923 0%, #1a2940 100%)"
          : "linear-gradient(135deg, #0a0d10 0%, #111519 100%)",
        border: unlocked
          ? "1px solid rgba(0, 212, 255, 0.4)"
          : "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "20px",
        transition: "all 0.3s ease",
        cursor: "default",
        overflow: "hidden",
        opacity: comingSoon ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (unlocked) {
          e.currentTarget.style.borderColor = "rgba(0, 212, 255, 0.8)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 212, 255, 0.2)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = unlocked
          ? "rgba(0, 212, 255, 0.4)"
          : "rgba(255,255,255,0.06)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Glow top bar for unlocked */}
      {unlocked && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent, #00d4ff, transparent)",
          }}
        />
      )}

      {/* Lock overlay for locked */}
      {!unlocked && !comingSoon && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            fontSize: "14px",
            opacity: 0.3,
          }}
        >
          🔒
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        {/* Icon */}
        <div
          style={{
            fontSize: "28px",
            lineHeight: 1,
            filter: unlocked ? "none" : "grayscale(1) opacity(0.3)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.05em",
              color: unlocked ? "#00d4ff" : "#3a4555",
              marginBottom: "4px",
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: unlocked ? "#8899aa" : "#2a3340",
              lineHeight: 1.5,
            }}
          >
            {comingSoon ? "— Próximamente —" : description}
          </div>

          {/* Progress bar */}
          {hasProgress && !unlocked && (
            <div style={{ marginTop: "10px" }}>
              <div
                style={{
                  background: "#0d1520",
                  borderRadius: "4px",
                  height: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #1a6b8a, #00d4ff)",
                    borderRadius: "4px",
                    transition: "width 1s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#3a5060",
                  marginTop: "4px",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {progress} / {goal}
              </div>
            </div>
          )}

          {/* Unlocked badge */}
          {unlocked && (
            <div
              style={{
                display: "inline-block",
                marginTop: "8px",
                background: "rgba(0, 212, 255, 0.1)",
                border: "1px solid rgba(0, 212, 255, 0.3)",
                borderRadius: "4px",
                padding: "2px 8px",
                fontSize: "10px",
                color: "#00d4ff",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              ✓ Desbloqueado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Category section ─────────────────────────────────────────────────────────
const CATEGORY_META = {
  log: { label: "Inicio de Sesión", color: "#a78bfa" },
  win: { label: "Victorias", color: "#fbbf24" },
  games: { label: "Partidas", color: "#34d399" },
};

function AchievementCategory({ categoryKey, achievements, t }) {
  const meta = CATEGORY_META[categoryKey];
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const total = achievements.filter((a) => !a.comingSoon).length;

  return (
    <div style={{ marginBottom: "32px" }}>
      {/* Category header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "3px",
            height: "18px",
            background: meta.color,
            borderRadius: "2px",
            boxShadow: `0 0 8px ${meta.color}`,
          }}
        />
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: meta.color,
            fontWeight: 700,
          }}
        >
          {meta.label}
        </span>
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "11px",
            color: "#3a4555",
          }}
        >
          {unlocked}/{total}
        </span>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "12px",
        }}
      >
        {achievements.map((a) => (
          <AchievementCard key={a.id} achievement={a} />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AchievementsSection({ stats, t }) {
  const achievements = useMemo(() => computeAchievements(stats, t), [stats, t]);

    console.info("T achievements:", t?.achievements);
    console.info("Stats prop:", stats);
  const grouped = useMemo(() => {
    return {
      log: achievements.filter((a) => a.category === "log"),
      win: achievements.filter((a) => a.category === "win"),
      games: achievements.filter((a) => a.category === "games"),
    };
  }, [achievements]);

    console.info("Achievements calculados:", achievements);  // ← añade esto
    console.info("Grouped:", grouped);
  if (!achievements.length) return null;

  const totalUnlocked = achievements.filter((a) => a.unlocked).length;
  const totalAchievable = achievements.filter((a) => !a.comingSoon).length;
  const globalPct = Math.round((totalUnlocked / totalAchievable) * 100);

  return (
    <div
      style={{
        background: "#080c10",
        borderRadius: "16px",
        padding: "32px",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "18px",
            fontWeight: 700,
            color: "#e2e8f0",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {t.achievements.title}
        </h2>
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "13px",
            color: "#00d4ff",
          }}
        >
          {totalUnlocked}/{totalAchievable} · {globalPct}%
        </span>
      </div>

      {/* Global progress bar */}
      <div
        style={{
          background: "#0d1520",
          borderRadius: "4px",
          height: "3px",
          marginBottom: "32px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${globalPct}%`,
            height: "100%",
            background: "linear-gradient(90deg, #00d4ff, #a78bfa)",
            borderRadius: "4px",
            transition: "width 1.5s ease",
          }}
        />
      </div>

      {/* Categories */}
      {Object.entries(grouped).map(([key, list]) => {
        {console.info("Achievement:", key, "=> ", list)}
        return (
        <AchievementCategory
          key={key}
          categoryKey={key}
          achievements={list}
          t={t}
        />)
      }
      )}
    </div>
  );
}
