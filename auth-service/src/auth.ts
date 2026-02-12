import argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { getDB } from './db';
import { hashPassword, verifyPassword } from './password';

export interface AuthUser {
	id: string,
	email: string;
	twofa_enabled: number;
	password_version: number;
	token_version: number;
}
/*
export interface OpenAuthUser {
	id: string,
	email: string;
	twofa_enabled: number;
	password_version: number;
	token_version: number;
	provider: string;
	provider_id: string;
	needs_password: number;
}
*/
function generateUserId() {
	return `u_${randomUUID()}`;
}

export async function signup(email: string, password: string): Promise<AuthUser> {
	const hash = await hashPassword(password);

	const userId = generateUserId();
	return new Promise<AuthUser>((resolve, reject) => {
		const db = getDB();
		db.run(
			`INSERT INTO users (id, email, password_hashed) VALUES(?, ?, ?)`,
			[userId, email, hash],
			err => {
				if (err) reject(err);
				else   resolve({
					id: userId,
				      	email: email,
				      	twofa_enabled: 0,
					password_version: 1,
					token_version: 0,
				});
			}
		);
	});
}

export async function login(email: string, password: string): Promise<AuthUser> {
	const db = getDB();

	return new Promise<AuthUser>((resolve, reject) => {
		db.get(
			`SELECT * FROM users WHERE email = ?`,
		       [email],
		       async (err, row: any) => {
			       if (err) return reject(err);
			       if (!row) return reject(new Error('INVALID_CREDENTIALS'));
			       if (row.deleted_at) return reject(new Error('ACCOUNT_DELETED'))
		       	       const valid = await verifyPassword(password, row.password_hashed);
                    if (!valid) return reject(new Error('INVALID_CREDENTIALS'));
                    resolve({
                        id: row.id,
                        email: row.email,
                        twofa_enabled: row.twofa_enabled ?? 0,
                        password_version: row.password_version ?? 1,
                        token_version: row.token_version ?? 0,
                    });
		       }
		)
	});
}

export async function oauthLoginOrSignup(profile, provider) {

      	const db = getDB();

	let user = await db.get(`SELECT * FROM users WHERE provider=? AND provider_id=?`, 
			       [provider, profile.id]);

      	if (user?.deleted_at)
	    	throw new Error('ACCOUNT_DELETED');

      	if (user) return { user, isNew: false };

      	if (profile.email) {
	    	user = await db.get(`SELECT * FROM users WHERE email=?`, 
				    [profile.email]);

	    	if (user) {
		  	await db.run(`UPDATE users SET provider=?, provider_id=? WHERE id=?`,
				     [provider, profile.id, user.id]);

		  	return { user, isNew: false };
	    	}
      	}

	// --- Signup ---
  
	const user_id = generateUserId();
	const temp = randomUUID();
      	const hash = await hashPassword(temp);

      	const res = await db.run(`INSERT INTO users (
		id,
	  	email,
	  	password_hash,
	  	needs_password,
	  	provider,
	  	provider_id,
	  	password_version
    	)
    	VALUES (?, ?, ?, 1, ?, ?, 1)
      	`, [
      		user_id,
	    	profile.email,
	    	hash,
	    	provider,
	    	profile.id
      	]);

      	return {
	    	user: { id: res.lastID },
	    	isNew: true
      	};
}


function generateEmail(): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(4).toString('base64url');

  const tail = (ts + rand).slice(0, 10);

  return `deleted_${tail}_@${tail}.deleted`;
}
