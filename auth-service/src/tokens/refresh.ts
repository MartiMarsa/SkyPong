import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getTokenDB } from '../database/dbTokens';
import { privateKey, publicKey } from '../keys';
import * as AuthInterfaces from '../types/auth.interfaces';

export async function createRefreshToken(userId: string): Promise<string> {
    	const db = getTokenDB();
    	const tokenId = randomUUID();
    	const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(); // 7 days

    	db.run(
		`INSERT INTO refresh_tokens (id, user_id, expires_at, revoked) VALUES (?, ?, ?, 0)`,
		[tokenId, userId, expiresAt]
    	);

    	const token = jwt.sign(
		{ sub: userId, tokenId, type: 'refresh' },
		privateKey,
		{ algorithm: 'RS256', expiresIn: '7d', issuer: 'auth-service' }
    	);

	return token;
}

export async function verifyRefreshToken(token: string): Promise<AuthInterfaces.RefreshPayload | null> {
    	try {
		const payload: any = jwt.verify(token, publicKey, { issuer: 'auth-service' });

		if (payload.type !== 'refresh' || !payload.sub || !payload.tokenId) return null;

		const db = getTokenDB();
		const row: any = await new Promise((res, rej) => {
	    		db.get(`SELECT * FROM refresh_tokens WHERE id = ?`, [payload.tokenId], (err, row) =>
	       		       err ? rej(err) : res(row)
		  	      );
		});

		if (!row || row.revoked) return null;

		return { userId: payload.sub, tokenId: payload.tokenId, type: 'refresh' };
	} catch {
		return null;
    	}
}

export async function revokeRefreshToken(tokenId: string): Promise<void> {
    	const db = getTokenDB();
    	db.run(`UPDATE refresh_tokens SET revoked = 1 WHERE id = ?`, [tokenId]);
}

export async function revokeRefreshTokenById(userId: string): Promise<void> {
	const db = getTokenDB();
	db.run(`UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?`,
	      [userId]);
}

export async function isTokenRevoked(tokenId: string): Promise<boolean> {
    	const db = getTokenDB();
    	const row: any = await new Promise((res, rej) => {
		db.get(`SELECT revoked FROM refresh_tokens WHERE id = ?`, [tokenId], (err, row) =>
	   	       err ? rej(err) : res(row)
	      	      );
    	});
    	return !row ? true : !!row.revoked;
}

export function refreshTokenCleanup() {
    const db = getTokenDB();

    setInterval(() => {
        db.run(`
            UPDATE refresh_tokens SET revoked = 1
<<<<<<< HEAD:auth-service/src/tokens/refresh.ts
            WHERE expires_at < CURRENT_TIMESTAMP
        `);
    }, 15 * 60 * 1000);

    console.log(`[auth] Refresh tokens cleanup done at CURRENT_TIMESTAMP`);
=======
            WHERE expires_at < datetime('now')
        `);
    }, 15 * 60 * 1000);

    console.log(`[auth] Refresh tokens cleanup done at ${new Date().toISOString() }`);
>>>>>>> origin/main:auth-service/src/refresh.ts
}
