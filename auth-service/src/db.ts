import path from 'path';
import sqlite3 from 'sqlite3';

const dbPath = path.resolve(__dirname, '../auth.db');

const db = new sqlite3.Database(dbPath, err => {
	if (err) {
		console.error('Failed to connect to SQlite', err);
	} else {
		console.log('Connected to SQlite:', dbPath);
	}
});

export function initDB(): Promise<void> {

	return new Promise((resolve, reject) => {
		db.run(
       		       `CREATE TABLE IF NOT EXISTS users (
       			       id TEXT PRIMARY KEY,
			       email TEXT UNIQUE NOT NULL,
       			       password_hashed TEXT NOT NULL,
			       password_version INTEGER DEFAULT 1,
			       twofa_enabled INTEGER DEFAULT 0,
			       twofa_secret TEXT,
			       created_at TEXT DEFAULT CURRENT_TIMESTAMP
		       )`,
		       err => {
			       if (err) reject(err);
			       else resolve();
		       }
		      );
	});
}

export function getDB() {
	return db;
};
