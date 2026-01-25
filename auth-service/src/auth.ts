import argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { getDB } from './db';
import { hashPassword, verifyPassword } from './password';

export interface AuthUser {
	id: string,
	email: string;
	twofa_enabled: number;
	password_version: number;
}

export async function signup(email: string, password: string): Promise<AuthUser> {
	const hash = await hashPassword(password);

	const userId = `u_${randomUUID()}`;
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
		       	       const valid = await verifyPassword(password, row.password_hashed);
		       	       if (!valid) return reject(new Error('INVALID_CREDENTIALS'));
			       resolve({
				       id: row.id,
				       email: row.email,
				       twofa_enabled: row.twofa_enabled,
				       password_version: row.password_version,
			       });
		       }
		)
	});
}
