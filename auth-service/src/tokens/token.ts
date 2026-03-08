import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { privateKey } from '../keys';
import { getDB } from '../database/db';

export async function generateToken(user: {
    id: string;
    password_version: number;
    token_version: number;
}) {

    function toSqlUtcDatetime(date: Date): string {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 60 * 60 * 1000); // +1 hour

    const token = jwt.sign(
        {
            sub: user.id,
            pv: user.password_version,
            tv: user.token_version,
            iss: 'auth-service',
            aud: 'transcendence',
            iat: Math.floor(issuedAt.getTime() / 1000),
            exp: Math.floor(expiresAt.getTime() / 1000),
        },
        privateKey,
        { algorithm: 'RS256' }
    );

    const db = getDB();

    await new Promise<void>((resolve, reject) => {
        db.run(
            `
            INSERT INTO user_sessions (id, user_id, issued_at, expires_at, token_version)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id)
            DO UPDATE SET
                id = excluded.id,
                issued_at = excluded.issued_at,
                expires_at = excluded.expires_at,
                token_version = excluded.token_version
            `,
            [
                crypto.randomUUID(),
                user.id,
                toSqlUtcDatetime(issuedAt),
                toSqlUtcDatetime(expiresAt),
                user.token_version,
            ],
            (err) => (err ? reject(err) : resolve())
        );
    });

    return token;
}


export async function deleteUserSession(userId: string): Promise<void> {
  const db = getDB();

  await db.run(
    `DELETE FROM user_sessions WHERE user_id = ?`,
    [userId]
  );
}

export function startSessionCleanup() {
    const db = getDB();

    setInterval(() => {
        db.run(`
            DELETE FROM user_sessions
            WHERE expires_at < CURRENT_TIMESTAMP
        `);
    }, 15 * 60 * 1000);

<<<<<<< HEAD:auth-service/src/tokens/token.ts
	console.log(`[auth] Session cleanup done at CURRENT_TIMESTAMP`);
=======
	console.log(`[auth] Session cleanup done at ${new Date().toISOString() }`);
>>>>>>> origin/main:auth-service/src/token.ts
}
