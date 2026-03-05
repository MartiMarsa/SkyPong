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

async function hasColumn(
  db: sqlite3.Database,
  table: string,
  column: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows: any[]) => {
      if (err) return reject(err);
      resolve(rows.some(r => r.name === column));
    });
  });
}

async function addColumnIfMissing(
  db: sqlite3.Database,
  table: string,
  columnDef: string,
  columnName: string
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const exists = await hasColumn(db, table, columnName);
      if (exists) return resolve();

      db.run(
        `ALTER TABLE ${table} ADD COLUMN ${columnDef}`,
        err => err ? reject(err) : resolve()
      );
    } catch (e) {
      reject(e);
    }
  });
}


/*
export function initDB(): Promise<void> {

	return new Promise((resolve, reject) => {

			db. serialize(() => {

			let failed = false;

			const onError = (err: Error | null) => {
				if (err && !failed) {
					failed = true;
					db.run('ROLLBACK');
					reject(err);
				}
			};

			db.run('PRAGMA journal_mode = WAL');
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

			await addColumnIfMissing(db, 'users', 'provider TEXT', 'provider');
			await addColumnIfMissing(db, 'users', 'provider_id TEXT', 'provider_id');
			await addColumnIfMissing(db, 'users', 'needs_password INTEGER DEFAULT 0', 'needs_password');

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
}*/

export function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      (async () => {
        try {
          db.run('PRAGMA journal_mode = WAL');

          db.run(`
            CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              password_hashed TEXT NOT NULL,
              password_version INTEGER DEFAULT 1,
              twofa_enabled INTEGER DEFAULT 0,
              token_version INTEGER DEFAULT 0,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              deleted_at TEXT
            )
          `);

		  db.run(`
			CREATE TABLE IF NOT EXISTS user_sessions (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL,
			  	issued_at TEXT NOT NULL,
			  	expires_at TEXT NOT NULL,
			  	token_version INTEGER NOT NULL,
			  	created_at TEXT DEFAULT CURRENT_TIMESTAMP
				);
			`);

          resolve();
        } catch (err) {
          reject(err);
        }
      })();
    });
  });
}


export function getDB() {
	return db;
};
