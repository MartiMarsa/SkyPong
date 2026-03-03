import axios from 'axios';
import { getLeaderboardDB } from './dbLeaderboard';
import { sleep, getDbHelpers } from './helpers';
import * as StatsTypes from './stats.types';
import * as StatsConst from './stats.const';

// --- CONFIG ---
const PROFILE_API = process.env.PROFILE_SERVICE_URL ?? 'http://profile-service:5000';

const TOKEN = process.env.SERVICE_TOKEN || 'secret'; // process.env.SERVICE_TOKEN;
let interval = 2000;
const MAX_FAILURES = 5;

// --- DB ---
const db = getDbHelpers(getLeaderboardDB());

// --- GET LAST SYNCRONIZATION DATE ---
async function getLastSync(): Promise<string> {
       	const row = await db.get<{ last: string }>(
	    	'SELECT MAX(updated_at) as last FROM leaderboard_cache'
      	);
      
	return row?.last ?? '2026-01-01';
}

// --- SYNCHRONIZE LEADERBOARD ---
async function syncOnce(): Promise<{ players: StatsTypes.PlayerStat[]; last: string }> {
      	const lastSync = await getLastSync();

      	const res = await axios.get(`${PROFILE_API}/internal/profile/leaderboard/updates`, {
	    	params: { since: lastSync },
	    	headers: { Authorization: `Bearer ${TOKEN}` },
	    	timeout: 5000
      	});

      	return res.data;
}

// --- UPSERT OF NEW DATA --- 
async function upsert(p: StatsTypes.PlayerStat) {

      	await db.run(`INSERT INTO leaderboard_cache (

	  	user_id,

	  	played,
	  	wins,
	  	losses,

	  	winrate,
	  	rate,

	  	updated_at

    	)
    	VALUES (?,?,?,?,?,?,?)

    	ON CONFLICT(user_id)
    	DO UPDATE SET

		played = excluded.played,
	  	wins   = excluded.wins,
	  	losses = excluded.losses,

	  	winrate = excluded.winrate,
	  	rate    = excluded.rate,

	  	updated_at = excluded.updated_at`, 
		[

		    	p.user_id,

		    	p.played,
		    	p.wins,
		    	p.losses,

		    	p.winrate,
		    	p.rate,

		    	p.updated_at
	      	]);
}

// --- LOOP ---
export async function leaderboardLoop(abortSignal: AbortSignal, onError: (err: unknown) => void) {
      
	console.log('[LeaderboardWorker] started');

      	let failures = 0;

      	while (!abortSignal.aborted) {
	    	try {
		  	const data = await syncOnce();

		  	for (const p of data.players) {
				await upsert(p);
		  	}

		  	console.log('[LeaderboardWorker] synced', data.players.length);

		  	failures = 0;
		  	interval = data.players.length ? 1000 : 4000;

	    	} catch (err) {
//		  	console.error('[LeaderboardWorker] error:', err);
			console.error('[LeaderboardWorker] error:');

		  	onError(err);

		  	failures++;
		  	interval = Math.min(interval * 2, 10_000);

		  	if (failures >= MAX_FAILURES) {
				console.error('[LeaderboardWorker] too many failures, crashing');
				throw err;
		  	}
	    	}

		if (abortSignal.aborted) break;

		await sleep(interval, abortSignal);


	}

      	console.log('[LeaderboardWorker] stopped');
}

// --- GET LEADERBOARD ---
export async function getLeaderboardByIndex(index: StatsConst.LeaderboardIndex, limit = 50, offset = 0): Promise<StatsTypes.LeaderboardRow[]> {

	const cfg = StatsConst.LEADERBOARD_INDEXES[index];

	const sql = `SELECT * FROM leaderboard_cache ORDER BY ${cfg.column} ${cfg.order} LIMIT ? OFFSET ?`;

	return db.all<StatsTypes.LeaderboardRow>(sql, [limit, offset]);
}

