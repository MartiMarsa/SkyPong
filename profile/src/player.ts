import { getProfileDB } from './dbPlayers';
import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const MAX_RETRIES = 5;

/*TODO Make sure, that default avatar exist in uploads/avatars */
const DEFAULT_AVATAR = '/static/avatars/default.webp';

// --- UTILS ---
interface UpdatePlayerInfo {
	nickname?: string;
	winPhrase?: string;
	localization?: string;
}

function generateNickname(isDeleted: boolean): string {
	const ts = Date.now().toString(36);
	const rand = crypto.randomBytes(4).toString("base64url");
	const tail = (ts + rand).slice(0, 10);

	if (isDeleted === 0) { return "u_" + tail; }

	return "deleted_" + tail;
}

function calculateRate(userRate: number, opponentRate: number, result: string): number {
	const K = 42;
	const expected = 1 / (1 + Math.pow(10, (opponentRate - userRate) / 400));
    	const score = result === 'win' ? 1 : 0;
	const finalRate = Math.round(userRate + K * (score - expected));

	return finalRate >= 0 ? finalRate : 0;
}

// --- WRAPPERS FOR DATABASE ---
export function createDbHelpers(db: sqlite3.Database) {
      	return {
	    	run(sql: string, params: any[] = []) {
		  	return new Promise<{ changes: number }>((resolve, reject) => {
				db.run(sql, params, function(err) {
			      		if (err) reject(err);
			      		else resolve({ changes: this.changes });
				});
		  	});
	    	},

	    	get<T>(sql: string, params: any[] = []) {
		  	return new Promise<T | undefined>((resolve, reject) => {
				db.get(sql, params, (err, row) => {
			      		if (err) reject(err);
			      		else resolve(row);
				});
		  	});
	    	},

	    	all<T>(sql: string, params: any[] = []) {
		  	return new Promise<T[]>((resolve, reject) => {
				db.all(sql, params, (err, rows) => {
			      		if (err) reject(err);
			      		else resolve(rows);
				});
		  	});
	    	}
      	};
}

type ApplyResult =
  | { applied: false }
  | { applied: true; rate: number };

// --- MAIN FUNCTIONS ---
export function getPlayerById(user_id: string): Promise<any> {
	
	const db = getProfileDB();

	return new Promise((resolve, reject) => {
		db.get(
			`SELECT * FROM players WHERE user_id = ?`,
		       	[user_id],
			(err, row) => {
				if (err) return reject(err);
				resolve(row ?? null);
			}
		);
	});

}

export async function createPlayer(user_id: string): Promise<any> {
      	const db = getProfileDB();

      	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
	    	const nickname = generateNickname(false);

	    	try {
		  	await new Promise<void>((resolve, reject) => {
				db.run(
			      		`INSERT INTO players (user_id, nickname) VALUES (?, ?)`,
			      		[user_id, nickname],
			      		function (err) {
				    		if (err) return reject(err);
				    		resolve();
			      		}
				);
		  	});

		  	const row = await new Promise<any>((resolve, reject) => {
				db.get(
			      		`SELECT * FROM players WHERE user_id = ?`,
				      		[user_id],
			      		(err, row) => {
				    		if (err) reject(err);
				    		else resolve(row);
			      		}
				);
		  	});

		  	console.log(`Player created on attempt #${attempt}: ${nickname}`);
		  	return row;

	    	} catch (err: any) {
		  	if (err.code === 'SQLITE_CONSTRAINT') {
				console.warn(`Nickname collision on attempt #${attempt}, retrying...`);
				if (attempt === MAX_RETRIES) {
			      		throw new Error('Failed to generate unique nickname after max retries');
				}
				continue;
		  	}
		  	throw err;
	    	}
      	}
}

export function updatePlayerInfo(user_id: string, data: UpdatePlayerInfo): Promise<void> {

	const db = getProfileDB();

	const fields: string[] = [];
	const values: any[] = []; /*TODO change to string, any is for testing only */

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

	if (fields.length === 0) {
		return Promise.resolve();
	}

	values.push(user_id); 

	const sql = `UPDATE players SET ${fields.join(', ')} where user_id = ?`;

	return new Promise((resolve, reject) => {
	    	db.run(sql, values, err => {
		  	if (err) reject(err);
		  	else resolve();
	    	});
      	});	
}

export async function updatePlayerAvatar(userId: string, avatarUrl: string): Promise<void> {
	const db = getProfileDB();

	const finalAvatar = avatarUrl && avatarUrl.length > 0 ? avatarUrl : DEFAULT_AVATAR;

	await new Promise<void>((resolve, reject) => {
		db.run(`UPDATE players SET avatarUrl = ? WHERE user_id = ?`,
		[finalAvatar, userId],
		err => (err ? reject(err) : resolve())
		      );
	});
}

export async function softdeletePlayer(userId: string): Promise<void> {
	const db = getProfileDB();

	const new_nickname = generateNickname(true);

	await new Promise<void>((resolve, reject) => {
		db.run(`UPDATE players SET nickname = ?, avatarUrl = DEFAULT_AVATAR, deleted = 1, deleted_at = CURRENT_TIMESTAMP`, 
		[new_nickname],
		err => (err ? reject(err) : resolve())
		);
	});
}

export async function updatePlayerStats(userId: string, gameId: string, result: 'win' | 'loss', opponentRate: number): Promise<ApplyResult> {

	const db = getProfileDB();
	const { run, get, all } = createDbHelpers(db);

      	await run('BEGIN IMMEDIATE');

      	try {
	    	const reserve = await run(`INSERT OR IGNORE INTO processed_games(game_id, user_id) VALUES (?, ?)`, 
					  [gameId, userId]);

   
		if (reserve.changes === 0) {
		  	await run('ROLLBACK');
		  	return { applied: false };
	    	}

	    	const player = await get<{ 
			wins: number; 
			losses: number; 
			rate: number; }>
			(`SELECT wins, losses, rate FROM player_stats WHERE user_id=?`, 
      			 [userId]);

	       	   if (!player) {
		     	   throw new Error(`Player ${userId} not found`);
	       	   }

	       	   const wins = player.wins + (result === 'win' ? 1 : 0);
	       	   const losses = player.losses + (result === 'loss' ? 1 : 0);
	       	   const played = wins + losses;
	       	   const winrate = played > 0 ? wins / played : 0;
	       	   const newRate = calculateRate(player.rate, opponentRate, result);

	       	   await run(`UPDATE player_stats SET wins=?, losses=?, played=?, winrate=?, rate=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?`, 
			     [wins, losses, played, winrate, newRate, userId]);

		    await run('COMMIT');

		    return {
		      	    applied: true,
		      	    rate: newRate
		    };

      	} catch (e) {
	    	await run('ROLLBACK');
	    	throw e;
      	}
}

export async function getUserPublicProfile(nickname: string): Promise<any | null> {
	const db = getProfileDB();
	
	const user: any = await new Promise((resolve, reject) => {
	    	db.get(`SELECT user_id, nickname, avatarUrl, winPhrase FROM players WHERE nickname = ?`,
		[nickname],
		(err, row) => {
			if (err) return reject(err);
			resolve(row);
	  	}
		      );
      	});

      	if (!user) return null;

      	const stat: any = await new Promise((resolve, reject) => {
	    	db.get(`SELECT played, wins, losses, winrate, rate FROM player_stats WHERE user_id = ?`,
		[user.user_id],
      		(err, row) => {
			if (err) return reject(err);
			resolve(row || { wins: 0, losses: 0 });
		}
		      );
	});

//      	const played = stat.wins + stat.losses;
//      	const winrate = played > 0 ? (stat.wins / played) * 100 : 0;

      	return {
	    	nickname: user.nickname,
	    	avatarUrl: user.avatarUrl,
	    	winPhrase: user.winPhrase,
	    	stats: {
		  	played: stat.played,
		  	wins: stat.wins,
		  	losses: stat.losses,
		  	winrate: parseFloat(stat.winrate.toFixed(2)),
			rate: stat.rate,
	    	},
      	};
}

