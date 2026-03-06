import axios from 'axios';
import { getStatisticsDB } from './dbStats';
import { sleep, getDbHelpers } from './helpers';
import * as StatsTypes from './stats.types';
import { GameRow } from './stats.types';

// --- CONFIG ---
//const PROFILE_API = 'http://profile-service:8082/internal/profile/gameresult/update';
const PROFILE_API = process.env.PROFILE_SERVICE_URL ?? 'http://profile-service:5000/internal/profile/gameresult/update';
//const TOKEN = process.env.SERVICE_TOKEN;
const TOKEN = process.env.SERVICE_TOKEN || 'secret';

const MAX_FAILURES = 5;
const BATCH_SIZE = 10;
let interval = 2000; // 2 sec

// --- DB ---
const db = getDbHelpers(getStatisticsDB());

// --- Main logic ---

async function lockGames(): Promise<GameRow[]> {

	const { exec, run, all } = db;

	try {
		await exec('BEGIN IMMEDIATE');

		const games = await all<StatsTypes.GameRow>(`SELECT * FROM games_and_results WHERE processed = 0 AND processing = 0 LIMIT ?`, 
						    [BATCH_SIZE]);

		if (games.length === 0) {
			await exec('COMMIT');
			return [];
		}

		const ids = games.map(g => g.game_id);
		const placeholders = ids.map(() => '?').join(',');

		await run(`UPDATE games_and_results SET processing = 1 WHERE game_id IN (${placeholders})`);

		await exec('COMMIT');

		return games;
	} catch (err) {
		await exec('ROLLBACK').catch(() => {});
	    	throw err;
	}
}

function buildPayload(game: StatsTypes.GameRow) {
	return {
		game_id: game.game_id,

		players: [
			{
				user_id: game.user1_id,
				result: game.user1_result
			},
			{
				user_id: game.user2_id,
				result: game.user2_result
			}
		]
	};
}

async function processGame(game: StatsTypes.GameRow) {

	const payload = buildPayload(game);

	await axios.post(PROFILE_API, payload, {
	    	timeout: 5000,
	    	headers: {
		  	Authorization: `Bearer ${TOKEN}`,
	    	},
      	});

	await db.run(`UPDATE games_and_results SET processed = 1, processing = 0, processed_at = (datetime('now','localtime')) WHERE game_id = ?`, 
		     [game.game_id]);
}

async function unlockGame(gameId: string) {

	await db.run(`UPDATE games_and_results SET processing = 0 WHERE game_id = ?`, 
		     [gameId]);
}

// --- Worker loop ---
export async function statisticsLoop(abortSignal: AbortSignal, onError: (err: unknown) => void) {

	console.log('[StatsWorker] started');

 
	let failures = 0;

      	while (!abortSignal.aborted) {
	    	try {
		  	const games = await lockGames();

		  	if (games.length === 0) {
				interval = 2000;
				
				try {
			      		await sleep(interval, abortSignal);
				} catch {
			      		break;
				}
				continue;
		  	}

		  	for (const game of games) {
				try {
			      		await processGame(game);

			      		console.log('[StatsWorker] OK', game.game_id);

				} catch (err) {
			      		console.error('[StatsWorker] FAIL', game.game_id, err);

			      		await unlockGame(game.game_id);
			      		onError(err);
				}
		  	}
		  
			failures = 0;

	    	} catch (err) {
		  	console.error('[StatsWorker] CRITICAL', err);

		  	onError(err);

		  	failures++;
		  	interval = Math.min(interval * 2, 10000);

		  	if (failures >= MAX_FAILURES) {
				console.error('[StatsWorker] too many failures, crashing');
				throw err;
		  	}
	    	}

	    	await sleep(interval, abortSignal);
      	}

      	console.log('[StatsWorker] stopped');
}

