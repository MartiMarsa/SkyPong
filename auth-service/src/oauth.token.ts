import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { privateKey, publicKey } from './keys';

interface OAuthPayload {
    	sub: string;
    	type: 'oauth-setup';
}

export function generateOAuthTempToken(userId: string) {
    return jwt.sign(
        {
            sub: userId,
            type: 'oauth-setup'
        },
        privateKey,
        {
            algorithm: 'RS256',
            expiresIn: '10m'
        });
}

export async function verifyOAuthTempToken(token: string): Promise<OAuthPayload | null> {

	try {
		const payload: any = jwt.verify(token, publicKey);

		if (payload.type !== 'oauth-setup'|| !payload.sub) return null;
		return { sub: payload.sub, type: 'oauth-setup' };
	} catch {
		return null;
	}
}

