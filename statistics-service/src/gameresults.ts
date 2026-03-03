import { getStatisticsDB } from './dbStats';
import { getDbHelpers } from './helpers';

// --- DB ---
const db = getDbHelpers(getStatisticsDB());

// --- TYPES ---
 type PlayerResult = {
       	 user_id: string;
       	 user_score: number;
       	 user_result: 'win' | 'loss';
};

type GameResult = {
      	game_id: string;
      	start_at: string;
      	end_at: string;
      
	players: PlayerResult[];
};

export enum AIUserType {
	EASY = 'ai-easy',
	MEDIUM = 'ai-medium',
	HARD = 'ai-hard',
}

export enum GameMode {
	AI = 'ai',
	REMOTE = 'remote-pvp',
}

const AI_USER_IDS = new Set<string>(Object.values(AIUserType));

function detectGameMode(user1Id: string, user2Id: string): GameMode {
  	if (AI_USER_IDS.has(user1Id) || AI_USER_IDS.has(user2Id)) {
		return GameMode.AI;
  	}

  	return GameMode.REMOTE;
}

export type GameHistoryRow = {
  game_id: string;
  user1_id: string;
  user2_id: string;
  user1_score: number;
  user2_score: number;
  user1_result: 'win' | 'loss';
  user2_result: 'win' | 'loss';
  start_at: string;
  end_at: string;
  game_mode: GameMode | 'local-pvp' | null;
};

export async function getGamesHistoryByUserId(userId: string): Promise<GameHistoryRow[]> {
  const { all } = db;

  const rows = await all<GameHistoryRow>(
    `
    SELECT
      game_id,
      user1_id,
      user2_id,
      user1_score,
      user2_score,
      user1_result,
      user2_result,
      start_at,
      end_at,
      game_mode
    FROM games_and_results
    WHERE user1_id = ? OR user2_id = ?
    ORDER BY end_at DESC
    `,
    [userId, userId]
  );

  return rows ?? [];
}

export async function addGameStats(game: GameResult): Promise<void> {

      	const { run } = db;

      	if (game.players.length !== 2) {
	    	throw new Error('Game must have exactly 2 players');
      	}


      	let [p1, p2] = game.players;


      	if (p1.user_id > p2.user_id) {
	    	[p1, p2] = [p2, p1];
	}

		const game_mode = detectGameMode(p1.user_id, p2.user_id);	

		console.log("----> GAME MODE IS: ", game_mode);

      	await run(
	    	`
	    	INSERT OR IGNORE INTO games_and_results (
		  	game_id,

		  	user1_id,
		  	user2_id,

		  	user1_score,
		  	user2_score,

		  	user1_result,
		  	user2_result,

		  	start_at,
		  	end_at,

			game_mode

	    	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	    	`,
	    	[
		  	game.game_id,

		  	p1.user_id,
		  	p2.user_id,

		  	p1.user_score,
		  	p2.user_score,

		  	p1.user_result,
		  	p2.user_result,

		  	game.start_at,
		  	game.end_at,

			game_mode
	    	]
      	);
}
