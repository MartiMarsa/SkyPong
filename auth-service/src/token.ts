import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { privateKey } from './keys';
import { getDB } from './db';

export async function generateToken(user: {
    id: string;
    password_version: number;
    token_version: number;
}) {

	function toSqlDatetime(date: Date): string {
	 	return date.toISOString().slice(0, 19).replace('T', ' ');
	}

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 60 * 60 * 1000); // 1h

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
            `,
            [
                crypto.randomUUID(),
                user.id,
                toSqlDatetime(issuedAt),
                toSqlDatetime(expiresAt),
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
