import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import cookie from '@fastify/cookie';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { randomUUID } from 'crypto';
import { signup, login } from './auth';
import { initDB, getDB } from './db';
import { initTokenDB, getTokenDB } from './dbTokens';
import { generateToken, generate2FAToken } from './token';
import { generate2FA, verify2FA } from './twofa';
import { createRefreshToken, verifyRefreshToken, revokeRefreshToken, revokeRefreshTokenById, isTokenRevoked } from './refresh';
import { hashPassword, verifyPassword } from './password';

const fastify = Fastify({ logger: true });

fastify.register(cookie, { secret: 'cookie-secret' });

const privateKey = fs.readFileSync('./jwt-private.pem');
const publicKey = fs.readFileSync('./jwt-public.pem');

// Better move to env
PROFILE_SERVICE_URL='http://profile-service:8082';
SERVICE_TOKEN='secret';


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

interface TwoFAVerifyBody {
	twofa_token: string;
      	code: string;
}

interface TwoFABody {
	id: string;
	code: string;
}

interface AuthBody {
	email: string;
	password: string;
}

interface LoginBody {
      	email: string;
      	password: string;
}

interface ChangePassword {
	old_password: string;
	new_password: string;
}

interface DBUser {
    	password_hashed: string;
    	password_version: number;
}

// --- CSRF protection ---
fastify.addHook('preHandler', async (req: any, reply) => {
	const authRoutes = ['/auth/signup', '/auth/login', '/auth/refresh'];

//	console.log(chalk.yellow(req.url));
    	if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !authRoutes.includes(req.url)) {
		const csrfCookie = req.cookies?.csrf_token;
		const csrfHeader = req.headers['x-csrf-token'];
		if (!csrfCookie || csrfCookie !== csrfHeader) {
	    		return reply.status(403).send({ error: 'CSRF' });
		}
    	}
});

// --- AUTH MIDDLEWARE ---
async function requireAuth(req: any, reply: any) {
      	const token = req.cookies?.access_token;
      	if (!token) return reply.status(401).send();

      	try {
	    	req.user = jwt.verify(token, publicKey, {
		  	algorithms: ['RS256'],
		  	issuer: 'auth-service',
		  	audience: 'transcendence',
	    	});

		const db = getDB();

		const user = await new Promise<any>((res, rej) => {
		  	db.get(`
		       	       SELECT id, password_version, token_version, deleted_at
		       	       FROM users
		       	       WHERE user_email = ?
			       	       `,
		       	       [req.user.sub],
		       	       (err, row) => err ? rej(err) : res(row)
			      );
      		});

		// user removed
		if (!user || user.deleted_at) {
		  	throw new Error('User deleted');
	    	}

		// password was changed
	    	if (req.user.pv !== user.password_version) {
			throw new Error('Password was changed');
		}

		// token revoked
		if (req.user.tv !== user.token_version) {
		  	throw new Error('Token revoked');
	    	}

		// attach user
		req.user = {
		  	id: user.id,
		  	password_version: user.password_version,
		  	token_version: user.token_version,
	    	};

	} catch {
		reply.clearCookie('access_token', { path: '/' });
	    	return reply.status(401).send({ error: 'Unauthorized' });
      	}
}

// --- SIGNUP ---
fastify.post('/auth/signup', async (req: any, reply) => {

    const { email, password } = req.body as AuthBody;
    const next = req.query.next || req.cookies?.last_page || '/me';

    const accessToken = req.cookies?.access_token;
    if (accessToken) {
	    try {
	      	    jwt.verify(accessToken, publicKey, { 
			    algorithms: ['RS256'], 
			    issuer: 'auth-service', 
			    audience: 'transcendence' 
		    });
	      	    return reply.status(200).send({ redirect: next });
	    } catch { }
    }

    if (!email || !password) {
        return reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: 'Invalid input: username, email and password required' },
        });
    }

    try {
        const user = await signup(email, password);

	const token = generateToken({ 
		id: user.id, 
		password_version: user.password_version || 1,
		token_version: user.token_version || 0
	});
	const refreshToken = createRefreshToken(user.id);
	const csrfToken = randomUUID();

	reply
	.setCookie('access_token', token, { ...cookieOpts, maxAge: 3600 })
	.setCookie('refresh_token', refreshToken, refreshOpts)
	.setCookie('csrf_token', csrfToken, { httpOnly: false, secure: true, sameSite: 'strict', path: '/' })
	.status(201)
	.send({ 
		user: { 
			id: user.id, 
			email: user.email,
		} 
	});
    } catch (err: any) {
        reply.status(409).send({ error: { code: 'EMAIL_OR_USERNAME_TAKEN', message: 'Already exists' } });
//	  reply.status(500).send({ error: { code: err.code, message: err.message }});
    }
});

// --- LOGIN ---
fastify.post('/auth/login', async (req: any, reply) => {

    const { email, password } = req.body as LoginBody;
    if (!email || !password) return reply.status(400).send('Email and password required');

    const next = req.query.next || req.cookies?.last_page || '/me';
    
    const accessToken = req.cookies?.access_token;
    if (accessToken) {
	    try {
	      	    jwt.verify(accessToken, publicKey, {
		    	    algorithms: ['RS256'],
		    	    issuer: 'auth-service',
		    	    audience: 'transcendence',
	      	    });
	      	    return reply.status(200).send({ redirect: next });
	    } catch { }
    }

    try {
        const user = await login(email, password);

        if (user.twofa_enabled) {
            const twofaToken = generate2FAToken(user.id);
            return reply.send({ twofa_required: true, twofa_token: twofaToken });
        }

        const token = generateToken({ 
		id: user.id, 
		password_version: user.password_version,
		token_version: user.token_version
	});
        const refreshToken = createRefreshToken(user.id);
        const csrfToken = randomUUID();

        reply
            .setCookie('access_token', token, { ...cookieOpts, maxAge: 3600 })
            .setCookie('refresh_token', refreshToken, refreshOpts)
            .setCookie('csrf_token', csrfToken, { httpOnly: false, secure: true, sameSite: 'strict', path: '/' })
	    .status(201)
	    .send({ 
		    user: { 
			    id: user.id, 
			    email: user.email 
		    } 
	    });
    } catch (err: any) {
        reply.status(401).send({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
//	  reply.status(500). send({ error: {code: err.code, message: err.message } });
    }
});

// --- CHANGE USER PASSWORD ---
fastify.post('/auth/password', { preHandler: requireAuth }, async (req: any, reply) => {

	const { old_password, new_password } = req.body as ChangePassword;

	if (!old_password || !new_password) {
		return reply.status(400).send({
			error: { 
				code: 'VALIDATION_ERROR', 
				message: 'Missing fields' },
	  	});
	}

	if (new_password.length < 8) {
	  	return reply.status(400).send({
			error: { 
				code: 'WEAK_PASSWORD', 
				message: 'Password too short' },
	  	});
    	} else if (new_password === old_password) {
		return reply.status(400).send({
			error: {
				code: 'SAME_PASSWORD',
				message: 'You can not use the same password' },
		});
	}

	const userId = req.user.sub;

	const db = getDB();

	const user = await new Promise<DBUser | null>((resolve, reject) => {
	    	db.get(
			`SELECT password_hashed, password_version FROM users WHERE id = ?`,
				[userId],
			(err, row) => {
		    		if (err) return reject(err);
		    		resolve(row as DBUser | null);
			}
	    	);
	});

	if (!user) {
		return reply.status(404).send();
    	}

	const valid = await verifyPassword(new_password, user.password_hashed);
    	if (valid === false) {
	  	return reply.status(403).send({
			error: {
		      		code: 'CURRENT_PASSWORD_INCORRECT',
		      		message: 'Current password is incorrect',
			},
	  	});
    	}
	
	const newHash = await hashPassword(new_password);

	await new Promise<void>((resolve, reject) => {
	  	db.run(
			`UPDATE users
	       		SET password_hash = ?, password_version = password_version + 1, token_version + 1,
	       		WHERE id = ?`,
				[newHash, userId],
			err => (err ? reject(err) : resolve())
	  	);
    	});

	await revokeRefreshTokenById(userId);

	reply.status(204).send();
});

// --- LOGOUT ---
fastify.post('/auth/logout', {preHandler: requireAuth }, async (req: any, reply) => {
	const refreshToken = req.cookies?.refresh_token;

    	if (refreshToken) {
		const payload = await verifyRefreshToken(refreshToken);
		if (payload) {
	    		await revokeRefreshToken(payload.tokenId);
		}
    	}

	const db = getDB();

	await new Promise<void>((resolve, reject) => {
		db.run(`
		       UPDATE users
		       SET token_version = token_version + 1
		       WHERE id = ?
		       `,
		       [req.user.id],
		       err => err ? reject(err) : resolve()
		      );
	});
	
	reply
        .clearCookie('access_token', { path: '/' })
        .clearCookie('refresh_token', { path: '/auth/refresh' })
        .clearCookie('csrf_token', { path: '/' })
        .send({ status: 'logged_out' });
});

fastify.delete('/auth/deleteme', { preHandler: requireAuth }, async (req: any, reply) => {
      	const userId = req.user.sub;
      	const db = getDB();
      	const dbToken = getTokenDB();

      	try {
	    	await new Promise<void>((resolve, reject) => {
		  	db.serialize(() => {
				db.run('BEGIN TRANSACTION');

				// 1. Revoke refresh tokens
			        dbToken.run(
			      		`UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?`,
					[userId],
					err => {
				    		if (err) {
					  		db.run('ROLLBACK');
				  			return reject(err);
			    		}

			    	// 2. Invalidate JW
				db.run(
			  		`UPDATE users SET token_version = token_version + 1 WHERE id = ?`,
					[userId],
			  		function (err) {
						if (err || this.changes === 0) {
				      			db.run('ROLLBACK');
				      			return reject(err || new Error('User not found'));
						}

				// 3. Delete user
				db.run(
		      			`DELETE FROM users WHERE id = ?`,
			      		[userId],
		      			function (err) {
			    			if (err) {
				  			db.run('ROLLBACK');
				  			return reject(err);
			    			}

					    	db.run('COMMIT');
	    					resolve();
		      			}
				);
			  		}
		    		);
			      		}
				);
		  	});
	    	});
/*
		// 4. Notify profile service
		try {
			const res = await fetch(
				`${process.env.PROFILE_SERVICE_URL}/internal/profile/deleteme`,
				{
					method: 'POST',
				  	headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${process.env.SERVICE_TOKEN}`,
				  	},
				  	body: JSON.stringify({ userId }),
				  	timeout: 5000, // node-fetch supports this
			    	}
		      	);

		      	if (!res.ok) {
			    	const text = await res.text();

			    	req.log.error(
				  	{
						status: res.status,
						body: text,
						userId,
				  	},
				  	'Profile deletion failed'
			    	);
		      	}

		} catch (err) {

		      	req.log.error(
			    	{ err, userId },
			    	'Profile service unreachable'
		      	);
		}
*/
		// 5. Clear cookies
	    	reply
	  	.clearCookie('access_token', { path: '/' })
	  	.clearCookie('refresh_token', { path: '/auth/refresh' })
	  	.clearCookie('csrf_token', { path: '/' })
	  	.send({ status: 'account_deleted' });

      	} catch (err) {
	    	req.log.error(err);
	    	reply.status(500).send({ error: 'ACCOUNT_DELETE_FAILED' });
	}
});

// --- REFRESH ---
fastify.post('/auth/refresh', async (req: any, reply) => {
    	const token = req.cookies?.refresh_token;
    	if (!token) return reply.status(401).send({ error: 'No refresh token' });

    	const payload = await verifyRefreshToken(token);
    	if (!payload || await isTokenRevoked(payload.tokenId)) {
		return reply.status(401).send({ error: 'Invalid refresh token' });
    	}

    	await revokeRefreshToken(payload.tokenId);

    	const db = getDB();
    	const user = await new Promise<any>((res, rej) => {
		db.get(
	    		`SELECT id, username, password_version FROM users WHERE id = ?`,
			[payload.userId],
			(err, row) => (err ? rej(err) : res(row))
		);
    	});

    	if (!user) return reply.status(401).send({ error: 'User not found' });

    	const newAccess = generateToken({
		id: user.id,
		password_version: user.password_version,
		token_version: user.token_version,
    	});

    	const newRefresh = createRefreshToken(user.id);
    	const csrfToken = randomUUID();

    	reply
	.setCookie('access_token', newAccess, { ...cookieOpts, maxAge: 3600 })
	.setCookie('refresh_token', newRefresh, refreshOpts)
	.setCookie('csrf_token', csrfToken, {
    		httpOnly: false,
		secure: true,
    		sameSite: 'strict',
    		path: '/',
	})
	.send({ ok: true });
});

// --- 2FA ---
fastify.post('/auth/2fa/setup', async (req, reply) => {
    	const { id } = req.body as TwoFABody; 
    	const result = await generate2FA(id);
    	reply.send(result);
});

fastify.post('/auth/2fa/enable', async (req, reply) => {
    	const { id, code } = req.body as TwoFABody;
    	
	const db = getDB();
    	
	const row = await new Promise<any>((res, rej) => {
		db.get(`SELECT twofa_secret FROM users WHERE id = ?`, [id], (err, row) => (err ? rej(err) : res(row)));
    	});

    	if (!row || !verify2FA(row.twofa_secret, code)) return reply.status(401).send({ error: 'Invalid 2FA code' });

    	db.run(`UPDATE users SET twofa_enabled = 1 WHERE id = ?`, [id]);
    	reply.send({ status: '2FA enabled' });
});

fastify.post('/auth/2fa/disable', async (req, reply) => {
	const { id, code } = req.body as TwoFABody;
	
	const db = getDB();

	const user = await new Promise,any>((res, rej) => {
		db.get(`SELECT twofa_secret FROM users WHERE id = ?`,
		      [id],
		      (err, row) => (err ? rej(err) : res(row)));
	});

	if (!user || !verify2FA(user.twofa_secret, code)) {
		return reply.status(401).send({ error: 'Invalid 2FA code' });
    	}

	await new Promise((res, rej) => {
		db.run(`UPDATE users SET twofa_enabled = 0, twofa_secret = NULL WHERE id = ?`,
	   	[id],
    		(err) => (err ? rej(err) : res(true))
		      );
    	});


    	reply.send({ status: '2FA disabled' });
});

fastify.get('/auth/verify', async (req: any, reply) => {
    	const token = req.cookies?.access_token;
    	if (!token) return reply.status(401).send();

    	try {

		const payload: any = jwt.verify(token, publicKey, {
			algorithms: ['RS256'],
			issuer: 'auth-service',
			audience: 'transcendence',
		});
		reply.header('X-User-Id', payload.sub).header('X-Username', payload.username).send();
    	} catch {
		reply.status(401).send();
    	}
});

fastify.post('/auth/2fa/verify', async (req, reply) => {
	const { twofa_token, code } = req.body as TwoFAVerifyBody;

    	let payload: any;
	try {
		payload = jwt.verify(twofa_token, publicKey, {
	    		algorithms: ['RS256'],
	    		issuer: 'auth-service',
		});
    	} catch {
		return reply.status(401).send({ error: 'Invalid 2FA token' });
    	}

    	const db = getDB();
    	const user = await new Promise<any>((res, rej) => {
		db.get(
	    		`SELECT id, username, password_version, twofa_secret FROM users WHERE id = ?`,
	    		[payload.sub],
	    		(err, row) => (err ? rej(err) : res(row))
		);
    	});

    	if (!user || !verify2FA(user.twofa_secret, code)) {
		return reply.status(401).send({ error: 'Invalid 2FA code' });
    	}

    	const accessToken = generateToken({
		id: user.id,
		password_version: user.password_version,
		token_version: user.token_version,
    	});

    	const refreshToken = createRefreshToken(user.id);
    	const csrfToken = randomUUID();

    	reply
	.setCookie('access_token', accessToken, { ...cookieOpts, maxAge: 3600 })
	.setCookie('refresh_token', refreshToken, refreshOpts)
	.setCookie('csrf_token', csrfToken, {
    		httpOnly: false,
    		secure: true,
    		sameSite: 'strict',
    		path: '/',
	})
	.send({ status: 'ok' });
});

// --- HEALTH ---
fastify.get('/health', async () => ({ status: 'ok', service: 'auth-service' }));

// --- START SERVER ---
const start = async () => {
    try {
        await initDB();
        console.log(chalk.green.bold('Database initialized'));
        await initTokenDB();
        console.log(chalk.green.bold('Refresh tokens database initialized'));
        await fastify.listen({ port: 8081, host: '0.0.0.0' });
        console.log(chalk.green.bold('Authentification is running on :8081'));
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

