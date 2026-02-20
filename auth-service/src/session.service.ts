import { generateToken } from './token';
import { createRefreshToken } from './refresh';
import { randomUUID } from 'crypto';
import { FastifyReply } from 'fastify';

// --- COOKIES ---
const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    path: '/',
};

const refreshOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    path: '/auth/refresh',
    maxAge: 7 * 24 * 3600,
};

// --- TYPES ---
interface UserAuth {
	id: string,
	email: string,
	twofa_enabled: number,
	password_version: number,
	token_version: number,
}

export async function issueSession(user: UserAuth, reply: FastifyReply, isNew: boolean = false) {
	const accessToken = generateToken({
		id: user.id,
		password_version: user.password_version || 1,
		token_version: user.token_version || 0
	});

  	const refreshToken = await createRefreshToken(user.id);

  	const csrfToken = randomUUID();

	if (isNew) {
		reply.clearCookie('oauth_tmp');
	}

  reply
    .setCookie('access_token', accessToken, { ...cookieOpts, maxAge: 3600 })
    .setCookie('refresh_token', refreshToken, refreshOpts)
    .setCookie('csrf_token', csrfToken, { httpOnly: false, secure: true, sameSite: 'strict', path: '/' })
	.status(201)
    .send({
        user: {
            id: user.id,
            email: user.email,
        }
    });
}
