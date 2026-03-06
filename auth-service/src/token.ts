import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { privateKey } from './keys';
import { getDB } from './db';

export async function generateToken(user: {
    id: string;
    password_version: number;
    token_version: number;
}) {

    function toSqlLocalDatetime(date: Date): string {
        const offset = date.getTimezoneOffset(); // смещение в минутах
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 60 * 60 * 1000); // +1 час

    const issuedAtLocalSeconds = Math.floor((issuedAt.getTime() - issuedAt.getTimezoneOffset() * 60000) / 1000);
    const expiresAtLocalSeconds = Math.floor((expiresAt.getTime() - expiresAt.getTimezoneOffset() * 60000) / 1000);

    const token = jwt.sign(
        {
            sub: user.id,
            pv: user.password_version,
            tv: user.token_version,
            iss: 'auth-service',
            aud: 'transcendence',
            iat: issuedAtLocalSeconds,
            exp: expiresAtLocalSeconds,
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
                toSqlLocalDatetime(issuedAt),
                toSqlLocalDatetime(expiresAt),
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
