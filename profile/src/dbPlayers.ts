import path from 'path';
import sqlite3 from 'sqlite3';

const dbPath = path.resolve(__dirname, '../profile.db');

const db = new sqlite3.Database(dbPath, err => {
	if (err) {
		console.error('Failed to connect to SQLite', err);
	} else {
		console.log('Connected to SQLite', dbPath);
	}
});

export function initProfileDB(): Promise<void> {

	return new Promise((resolve, reject) => {
		db.serialize(() => {

			let failed = false;

			const onError = (err: Error | null) => {
				if (err && !failed) {
			      		failed = true;
			      		db.run('ROLLBACK');
			      		reject(err);
				}
		  	};

			db.run('PRAGMA foreign_keys = ON');
			db.run('BEGIN');

			db.run(`CREATE TABLE IF NOT EXISTS players (
 				user_id TEXT PRIMARY KEY,
 				nickname TEXT NOT NULL,
 				avatarUrl TEXT,
 				winPhrase TEXT,
 				localization TEXT DEFAULT 'es',
				created_at TEXT DEFAULT CURRENT_TIMESTAMP
 			)`, onError);

			db.run(`CREATE UNIQUE INDEX IF NOT EXISTS players_nickname_unique
			       ON players(nickname)
			       `, onError);
			      
			db.run(`CREATE TABLE IF NOT EXISTS player_stats (
				user_id TEXT PRIMARY KEY,
		      		wins INTEGER DEFAULT 0,
		      		losses INTEGER DEFAULT 0,
		      		FOREIGN KEY(user_id) REFERENCES players(user_id) ON DELETE CASCADE
			)`, onError);


			db.run(`CREATE TABLE IF NOT EXISTS friends (
			      	id INTEGER PRIMARY KEY AUTOINCREMENT,

			      	user1_id TEXT NOT NULL,
			      	user2_id TEXT NOT NULL,

			      	status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'blocked')),

			      	requester_id TEXT NOT NULL,

				blocked_by TEXT,

			      	created_at TEXT DEFAULT CURRENT_TIMESTAMP,

			      	CHECK (user1_id < user2_id),
			      	CHECK (user1_id != user2_id),

			      	FOREIGN KEY(user1_id) REFERENCES players(user_id) ON DELETE CASCADE,
			      	FOREIGN KEY(user2_id) REFERENCES players(user_id) ON DELETE CASCADE,
			      	FOREIGN KEY(requester_id) REFERENCES players(user_id) ON DELETE CASCADE,
				FOREIGN KEY(blocked_by) REFERENCES players(user_id) ON DELETE CASCADE,

			      	UNIQUE(user1_id, user2_id)
			)`, onError);

			db.run(`CREATE INDEX IF NOT EXISTS friends_request_time
			       ON friends(created_at)
			       `, onError);

			db.run('COMMIT', err => {
				if (err) {
			      		db.run('ROLLBACK');
			      		return reject(err);
				}

				resolve();
			});
	    	});
      	});
}

export function getProfileDB() {
	return db;
};
