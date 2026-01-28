import { getProfileDB } from './dbPlayers';
import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const MAX_RETRIES = 5;

/*TODO Make sure, that default avatar exist in uploads/avatars */
const DEFAULT_AVATAR = '/static/avatars/default.webp';

interface UpdatePlayerInfo {
	nickname?: string;
	winPhrase?: string;
	localization?: string;
}

/*
function generateNickname(email: string): string {
  return (
    email.split('@')[0] +
    '_' +
    Math.random().toString(36).slice(2, 6)
  );
}*/

function generateNickname(): string {
	const ts = Date.now().toString(36);
	const rand = crypto.randomBytes(4).toString("base64url");

	return "u_" + (ts + rand).slice(0, 10);
}

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
	    	const nickname = generateNickname();

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
	    	db.get(`SELECT wins, losses FROM player_stats WHERE user_id = ?`,
		[user.user_id],
      		(err, row) => {
			if (err) return reject(err);
			resolve(row || { wins: 0, losses: 0 });
		}
		      );
	});

      	const played = stat.wins + stat.losses;
      	const winrate = played > 0 ? (stat.wins / played) * 100 : 0;

      	return {
	    	nickname: user.nickname,
	    	avatarUrl: user.avatarUrl,
	    	winPhrase: user.winPhrase,
	    	stats: {
		  	played: played,
		  	wins: stat.wins,
		  	losses: stat.losses,
		  	winrate: parseFloat(winrate.toFixed(2)),
	    	},
      	};
}

