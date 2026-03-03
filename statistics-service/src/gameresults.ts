import { getStatisticsDB } from './dbStats';
import { getDbHelpers } from './helpers';
import * as StatsTypes from './stats.types';

// --- DB ---
const db = getDbHelpers(getStatisticsDB());

export async function addGameStats(game: StatsTypes.GameResult): Promise<void> {

      	const { run } = db;

      	if (game.players.length !== 2) {
	    	throw new Error('Game must have exactly 2 players');
      	}


      	let [p1, p2] = game.players;


      	if (p1.user_id > p2.user_id) {
	    	[p1, p2] = [p2, p1];
	}


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
		  	end_at

	    	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
		  	game.end_at
	    	]
      	);
}
