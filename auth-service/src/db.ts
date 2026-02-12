import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const dataDir = process.env.AUTH_DATA_DIR?.trim() || path.resolve(process.cwd(), 'data');
const dbPath = process.env.AUTH_DB_PATH?.trim() || path.join(dataDir, 'auth.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath, err => {
	if (err) {
		console.error('Failed to connect to SQlite', err);
	} else {
		console.log('Connected to SQlite:', dbPath);
	}
});

export function initDB(): Promise<void> {

	return new Promise((resolve, reject) => {

			db. serialize((resolve, reject) => {

			let failed = false;

			const onError = (err: Error | null) => {
				if (err && !failed) {
					failed = true;
					db.run('ROLLBACK');
					reject(err);
				}
			};

			db.run('PRAGMA jornal_mode = WAL');
			db.run('BEGIN');

			db.run(
	 			`CREATE TABLE IF NOT EXISTS users (
	 				id TEXT PRIMARY KEY,
	 				email TEXT UNIQUE NOT NULL,
	 				password_hashed TEXT NOT NULL,
	 				password_version INTEGER DEFAULT 1,
			       			   
	 				twofa_enabled INTEGER DEFAULT 0,
	 				twofa_secret TEXT,
	 				token_version INTEGER DEFAULT 0,

	 				provider TEXT,
	 				provider_id TEXT,
	 				needs_password INTEGER DEFAULT 0,
	 				created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	 				deleted_at TEXT
				)`, onError);

			db.run(`CREATE UNIQUE INDEX idx_oauth
			       ON users(provider, provider_id)
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

export function getDB() {
	return db;
};
