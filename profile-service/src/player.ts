import { getProfileDB } from './dbPlayers';
import { getDbHelpers } from './helpers';
import crypto from 'crypto';

// --- CONFIG ---
const MAX_RETRIES = 5;
const DEFAULT_AVATAR = '/static/avatars/default.webp';

// --- DB ---
const db = getDbHelpers(getProfileDB());

// --- TYPES ---

interface UpdatePlayerInfo {
  nickname?: string;
  winPhrase?: string;
  localization?: string;
}

type PlayerResult = {
  user_id: string;
  result: 'win' | 'loss';
};

interface PlayerStats {
    played: number;
    wins: number;
    losses: number;
    winrate: number;
    rate: number;
    updated_at: string | null;
}

interface PlayerInfo {
    id: string;
    nickname: string;
    avatarUrl: string | null;
    winPhrase: string | null;
    localization: string;
    created_at: string;
	last_access_at: string;
	logged: number;
    stats: PlayerStats;
}

type LeaderboardRow = {
  user_id: string;

  played: number;
  wins: number;
  losses: number;

  winrate: number;
  rate: number;

  updated_at: string;
};

type ApplyResult =
  | { applied: false }
  | { applied: true; rate: number };

// --- UTILS ---

function generateNickname(isDeleted: boolean): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(4).toString('base64url');

  const tail = (ts + rand).slice(0, 10);

  return isDeleted ? `deleted_${tail}` : `u_${tail}`;
}

function calculateRate(
  userRate: number,
  opponentRate: number,
  result: 'win' | 'loss'
): number {
  const K = 42;

  const expected =
    1 / (1 + Math.pow(10, (opponentRate - userRate) / 400));

  const score = result === 'win' ? 1 : 0;

  const final = Math.round(userRate + K * (score - expected));

  return Math.max(final, 0);
}

// --- UTILS FOR DB ---
const PROFILE_QUERY = `
  SELECT
    p.user_id,
    p.nickname,
    p.avatarUrl,
    p.winPhrase,
    p.localization,
    p.created_at,

    s.played,
    s.wins,
    s.losses,
    s.winrate,
    s.rate,
    s.updated_at AS stats_updated_at
  FROM players p
  LEFT JOIN player_stats s ON s.user_id = p.user_id
  WHERE p.user_id = ?
    AND p.deleted = 0
  LIMIT 1
`;

// --------------------------------------------------
// GET PLAYER
// --------------------------------------------------

export async function getPlayerById(userId: string): Promise<PlayerInfo | null> {

	const row = await db.get<any>(PROFILE_QUERY, [userId]);
	
	if (!row) return null;

  	return {
			id: row.user_id,
			nickname: row.nickname,
			avatarUrl: row.avatarUrl ?? null,
			winPhrase: row.winPhrase ?? null,
			localization: row.localization,
			created_at: row.created_at,
			last_access_at: row.last_access_at,
			logged: row.logged,

			stats: {
					played: row.played ?? 0,
					wins: row.wins ?? 0,
			  		losses: row.losses ?? 0,
			  		winrate: row.winrate ?? 0,
			  		rate: row.rate ?? 0,
			  		updated_at: row.stats_updated_at ?? null,
			},
  	};
}

// --------------------------------------------------
// CREATE PLAYER
// --------------------------------------------------

export async function createPlayer(userId: string) {

  for (let i = 1; i <= MAX_RETRIES; i++) {

    const nickname = generateNickname(false);

    try {

      await db.run(
        `INSERT INTO players (user_id, nickname, last_access_at, logged)
         VALUES (?, ?, CURRENT_TIMESTAMP, 1)`,
        [userId, nickname]
      );

      await db.run(`
		   INSERT OR IGNORE INTO player_stats
		   (user_id, played, wins, losses, winrate, rate, updated_at)
		   VALUES
		   (?, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP)
		   `, 
		   [userId]
		  );

      const player = await getPlayerById(userId);

      if (!player) {
        throw new Error('Player not found after create');
      }

      console.log('[createPlayer]', userId, nickname);

      return player;

    } catch (err: any) {

      if (err?.code === 'SQLITE_CONSTRAINT') {

        if (i === MAX_RETRIES) {
          throw new Error('Nickname collision limit');
        }

        continue;
      }

      throw err;
    }
  }

  throw new Error('createPlayer failed');
}

// --------------------------------------------------
// UPDATE TEXT INFO
// --------------------------------------------------

export async function updatePlayerInfo(
  userId: string,
  data: UpdatePlayerInfo
) {

  const fields: string[] = [];
  const values: any[] = [];

  if (data.nickname !== undefined) {
    fields.push('nickname = ?');
    values.push(data.nickname);
  }

  if (data.winPhrase !== undefined) {
    fields.push('winPhrase = ?');
    values.push(data.winPhrase);
  }

  if (data.localization !== undefined) {
    fields.push('localization = ?');
    values.push(data.localization);
  }

  if (!fields.length) return;

  values.push(userId);

  const sql = `
    UPDATE players
    SET ${fields.join(', ')}
    WHERE user_id = ?
  `;

  await db.run(sql, values);
}

// --------------------------------------------------
// UPDATE AVATAR
// --------------------------------------------------

export async function updatePlayerAvatar(
  userId: string,
  avatarUrl: string
) {

  const final =
    avatarUrl && avatarUrl.length
      ? avatarUrl
      : DEFAULT_AVATAR;
  console.info("Updating avatar in DB: ", final);
  await db.run(
    `UPDATE players SET avatarUrl = ? WHERE user_id = ?`,
    [final, userId]
  );
}

// --------------------------------------------------
// UPDATE PLAYER'S ONLINE STATUS
// --------------------------------------------------
export async function updatePlayerOnlineStatus(userId: string, logged: boolean) {

	const repoDate = '2025-12-01';

	console.info("Updating player state...");

	if (logged) {
		await db.run(`UPDATE players SET last_access_at = CURRENT_TIMESTAMP, logged = 1 WHERE user_id = ?`, [userId]);
		console.info("User set as logged with date ...");
	} else {
		await db.run(`UPDATE players SET last_access_at = ?, logged = 0 WHERE user_id = ?`, [repoDate, userId]);
        console.info("User set as logged OUT with REPO date ...");
	}
}

// --------------------------------------------------
// SOFT DELETE
// --------------------------------------------------

export async function softdeletePlayer(userId: string) {

  const nickname = generateNickname(true);

  await db.run(
    `
    UPDATE players
    SET
      nickname = ?,
      avatarUrl = ?,
      deleted = 1,
      deleted_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
    `,
    [nickname, DEFAULT_AVATAR, userId]
  );
}

// --------------------------------------------------
// UPDATE STATS (TRANSACTION)
// --------------------------------------------------

export async function updatePlayerStats(
  gameId: string,
  p1: PlayerResult,
  p2: PlayerResult
): Promise<ApplyResult> {

  await db.exec('BEGIN IMMEDIATE');

  try {

    // reserve game
    const reserve = await db.run(
      `
      INSERT OR IGNORE INTO processed_games(game_id, processed_at)
      VALUES (?, CURRENT_TIMESTAMP)
      `,
      [gameId]
    );

    if (reserve.changes === 0) {
      await db.exec('ROLLBACK');
      return { applied: false };
    }

    // load players
    const players = await db.all<{
      user_id: string;
      wins: number;
      losses: number;
      rate: number;
    }>(
      `
      SELECT user_id, wins, losses, rate
      FROM player_stats
      WHERE user_id IN (?, ?)
      `,
      [p1.user_id, p2.user_id]
    );

    if (players.length !== 2) {

		await db.exec('ROLLBACK');
  		return { applied: false };
	}

    const A = players.find(p => p.user_id === p1.user_id)!;
    const B = players.find(p => p.user_id === p2.user_id)!;

    const newA = calculateRate(A.rate, B.rate, p1.result);
    const newB = calculateRate(B.rate, A.rate, p2.result);

    async function apply(
      userId: string,
      result: 'win' | 'loss',
      rate: number
    ) {

      await db.run(
        `
        UPDATE player_stats
        SET
          wins = wins + ?,
          losses = losses + ?,
          played = played + 1,
          winrate = ((wins + ?) * 1.0 / (played + 1)),
          rate = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        `,
        [
          result === 'win' ? 1 : 0,
          result === 'loss' ? 1 : 0,
          result === 'win' ? 1 : 0,
          rate,
          userId
        ]
      );
    }

    await apply(A.user_id, p1.result, newA);
    await apply(B.user_id, p2.result, newB);

    await db.exec('COMMIT');

    return {
      applied: true,
      rate: newA
    };

  } catch (err) {

    await db.exec('ROLLBACK');
    throw err;
  }
}

// --------------------------------------------------
// LEADERBOARD
// --------------------------------------------------

export async function getLeaderboard(lastSync: string) {

  const rows = await db.all<LeaderboardRow>(
    `
    SELECT
      s.user_id,
      s.played,
      s.wins,
      s.losses,
      s.winrate,
      s.rate,
      s.updated_at

    FROM player_stats s
    JOIN players p ON p.user_id = s.user_id

    WHERE
      s.updated_at > ?
      AND p.deleted = 0

    ORDER BY s.updated_at
    LIMIT 1000
    `,
    [lastSync]
  );

  return {
    last: rows.at(-1)?.updated_at || lastSync,
    players: rows
  };
}

// --------------------------------------------------
// PUBLIC PROFILE
// --------------------------------------------------

export async function getUserPublicProfile(userId: string): Promise<PlayerInfo | null> {

	const row = await db.get<any>(PROFILE_QUERY, [userId]);

    if (!row) return null;

    return {
            id: row.user_id,
            nickname: row.nickname,
            avatarUrl: row.avatarUrl ?? null,
            winPhrase: row.winPhrase ?? null,
            localization: row.localization,
            created_at: row.created_at,
			last_access_at: row.last_access_at,
            logged: row.logged,

            stats: {
                    played: row.played ?? 0,
                    wins: row.wins ?? 0,
                    losses: row.losses ?? 0,
                    winrate: row.winrate ?? 0,
                    rate: row.rate ?? 0,
					updated_at: row.stats_updated_at ?? null,
            },
    };

}
