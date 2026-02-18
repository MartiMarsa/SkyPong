import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import cookie from '@fastify/cookie';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { randomUUID } from 'crypto';
import { 
	signup, 
	login, 
	oauthLoginOrSignup, 
	generateEmail
} from './auth';
import { initDB, getDB } from './db';
import { initTokenDB, getTokenDB } from './dbTokens';
import { privateKey, publicKey } from './keys';
import { 
	generateToken, 
	generate2FAToken,
} from './token';
import { issueSession } from './session.service';
import { generate2FA, verify2FA } from './twofa';
import { 
	createRefreshToken, 
	verifyRefreshToken, 
	revokeRefreshToken, 
	revokeRefreshTokenById, 
	isTokenRevoked
} from './refresh';
import { providers } from './providers/providers';
import { hashPassword, verifyPassword } from './password';
import { generateOAuthTempToken, verifyOAuthTempToken } from './oauth.token';

const fastify = Fastify({ logger: true });

fastify.register(cookie, { secret: 'cookie-secret' });

const PROFILE_SERVICE_URL = process.env.PROFILE_SERVICE_URL ?? 'http://profile-service:5000';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN ?? 'secret';

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

const CSRF_IGNORED_METHODS = new Set([
	'GET', 
	'HEAD', 
	'OPTIONS'
]);

const CSRF_EXCLUDED_PATHS = new Set([
      	'/auth/signup',
      	'/auth/login',
      	'/auth/refresh',      
		'/auth/google',
      	'/auth/google/callback',
      	'/auth/set-password'
]);

// --- CSRF protection ---
fastify.addHook('preHandler', async (req: any, reply) => {

	if (CSRF_IGNORED_METHODS.has(req.method)) return;

	const checkUrl = req.url;

	if (CSRF_EXCLUDED_PATHS.has(checkUrl)) return;

	const csrfCookie = req.cookies?.csrf_token;
      	const csrfHeader = req.headers['x-csrf-token'];

      	if (!csrfCookie || csrfCookie !== csrfHeader) {
	    	return reply.status(403).send(); //{ error: 'CSRF' }
      	}
});

// --- AUTH MIDDLEWARE ---
async function authentificate(req: any): Promise<any | null> {

	const token = req.cookies?.access_token;

	if (!token) return null;

	try {
		const payload: any = jwt.verify(token, publicKey, {
			algorithms: ['RS256'],
			issuer: 'auth-service',
			audience: 'transcendence',
		});

		const db = getDB();

	    	const user = await new Promise<any>((res, rej) => {
		  	db.get(`SELECT id, email, password_version, twofa_enabled, token_version, deleted_at, needs_password FROM users WHERE id = ?`,
		       [payload.sub],
			(err, row) => (err ? rej(err) : res(row))
			      );
	    	});

	    	if (!user || user.deleted_at) return null;

	    	if (payload.pv !== user.password_version) return null;

	    	if (payload.tv !== user.token_version) return null;

	    	return user;

	} catch (err) {
            console.error("Error en jwt.verify:", err);
	    	return null;
	}
}

async function requireAuthAllowNeedsPassword(req: any, reply: any) {

	const user = await authentificate(req);      
	if (!user) {
		return reply.status(401).send(); // { error: 'Unauthorized' }
	};

      	req.user = user;
}

async function requireAuth(req: any, reply: any) {
      
	const user = await authentificate(req);
      	if (!user) {
		return reply.status(401).send(); // { error: 'Unauthorized' }
	}

      	if (user.needs_password) {
	    	return reply.status(403).send(); // { error: 'SET_PASSWORD_REQUIRED' }
      	}

      	req.user = user;
}

async function requireGuest(req: any, reply: any) {
      	const user = await authentificate(req);

      	if (!user) return;

//      	const next = req.cookies?.last_page || '/me';

		return reply.status(200).send({ id: user.id, email: user.email, username: 'HelloWorldPlayer', twofa_enabled: user.twofa_enabled });
}

// --- VERIFICATION IF USER IS ALREADY LOGGED ---
fastify.get('/auth/verify', { preHandler: requireAuth }, async (req: any, reply) => {

			const controller = new AbortController();

			setTimeout(() => controller.abort(), 5000);

			const user = req.user;

			let profile: any  = null;

			try {
			const res = await fetch(`${PROFILE_SERVICE_URL}/internal/profile/by-user-id/${user.id}`, { headers: { Authorization: `Bearer ${SERVICE_TOKEN}`, }, signal: controller.signal, });

			if (res.ok) {

			profile = await res.json() as any;
			}
			} catch (err) {
			req.log.error(err, 'Profile service unavailable');
			}

			req.log.info({ user: req.user }, 'Resultado de usuario en verify');

			return reply.status(200).send({ id: user.id, email: user.email, username: profile?.nickname ?? 'Unknown', twofa_enabled: user.twofa_enabled });
});

// --- SIGNUP ---
fastify.post('/auth/signup',{ preHandler: requireGuest }, async (req: any, reply) => {

    const { email, password } = req.body as AuthBody;

    if (!email || !password) {
        return reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: 'Invalid input: username, email and password required' },
        });
    }

    try {
        const user = await signup(email, password);

		return issueSession(user, reply);

    } catch (err: any) {
        reply.status(409).send(); //{ error: { code: 'EMAIL_OR_USERNAME_TAKEN', message: 'Already exists' } }
    }
});

// --- LOGIN ---
fastify.post('/auth/login', { preHandler: requireGuest }, async (req: any, reply) => {
    const { email, password } = req.body as LoginBody;
    if (!email || !password) return reply.status(400).send('Email and password required');

    try {
        const user = await login(email, password);

        if (user.twofa_enabled) {
            const twofaToken = generate2FAToken(user.id);
            return reply.send({ twofa_required: true, twofa_token: twofaToken });
        }

		return issueSession(user, reply);

    } catch (err: any) {
        reply.status(401).send(); //{ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } }
    }
});

// --- OAUTH WITH PROVIDER (GOOGLE OR ANY OTHER) ---
fastify.get<{ Params: { provider: string } }>('/auth/:provider', { preHandler: requireGuest },  async (req, reply) => {

      	const { provider } = req.params;

      	if (!providers[provider])
	    	return reply.code(404).send();

      	const state = randomUUID();

      	reply.setCookie('oauth_state', state, {
	    	httpOnly: true,
	    	sameSite: 'lax'
      	});

      	reply.redirect(
	    	providers[provider].auth(state)
      	);
});

// --- AOUTH CALLBACK ---
fastify.get<{
  Params: { provider: string };
  Querystring: {
    code: string;
    state: string;
  };
}>('/auth/:provider/callback', async (req, reply) => {

      	const { provider } = req.params;
      	const { code, state } = req.query;

      	if (state !== req.cookies.oauth_state)
	    	return reply.code(403).send();

      	const p = providers[provider];

		if (!p) return reply.code(404).send();

      	const access = await p.token(code);

      	const profile = await p.profile(access);

      	const { user, isNew } =
	    	await oauthLoginOrSignup(profile, provider);

		if (isNew) {
			const oauthToken = generateOAuthTempToken(user.id);

			reply
			.setCookie('oauth_tmp', oauthToken, { httpOnly: true, sameSite: 'strict', maxAge: 10 * 60 });

			return reply.redirect('/set-password');
		}

      	await issueSession(user, reply, isNew);
});

// --- NEED SET PASSWORD FOR OAUTH ---
fastify.post('/auth/set-password', {preHandler: requireAuthAllowNeedsPassword }, async (req: any, reply) => {

			 const token = req.cookies.oauth_tmp;
			 if (!token) return reply.code(401).send();

			 const verify = await verifyOAuthTempToken(token);
			 if (!verify) return reply.code(401).send();

		 	 const { password } = req.body;

	 		 if (!password || password.length < 8) {
	 		 return reply.status(400).send(); // error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' }
			 }

	 		 const db = getDB();

	 		 const user = await new Promise<any>((res, rej) => {
										 		 db.get(`SELECT id, needs_password, password_version, token_version FROM users WHERE id = ?`,
									 					[req.user.id],
														(err, row) => err ? rej(err) : res(row)
										 			   );
										 		 });

    	if (!user) {
	  	return reply.status(404).send({ error: 'USER_NOT_FOUND' });
    	}

    	if (!user.needs_password) {
	  	return reply.status(400).send({
			error: {
		      		code: 'PASSWORD_ALREADY_SET',
		      		message: 'Password already configured'
			}
	  	});
    	}

	const hash = await hashPassword(password);

    	await new Promise<void>((res, rej) => {
	  	db.run(`UPDATE users SET password_hash = ?, needs_password = 0, password_version = password_version + 1, token_version = token_version + 1 WHERE id = ?`,
	       	       [hash, user.id],
		err => err ? rej(err) : res()
		      );
    	});

		await issueSession(user, reply, true);

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
	const mockEmail = generateEmail();

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
					});

			    	// 2. Invalidate JW
				db.run(
			  		`UPDATE users SET token_version = token_version + 1 WHERE id = ?`,
					[userId],
			  		function (err) {
						if (err || this.changes === 0) {
				      			db.run('ROLLBACK');
				      			return reject(err || new Error('User not found'));
						}
					});

				// 3. Soft delete user (we are not deleting user, but changing personal data)
				db.run(
		      			`UPDATE users SET email = ?, password_version = password_version + 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
			      		[mockEmail, userId],
		      			function (err) {
			    			if (err) {
				  			db.run('ROLLBACK');
				  			return reject(err);
			    			}
					});
				
				db.run('COMMIT');
				resolve();
		  	});
	    	});
		// 4. Clear cookies
	    	reply
	  	.clearCookie('access_token', { path: '/' })
	  	.clearCookie('refresh_token', { path: '/auth/refresh' })
	  	.clearCookie('csrf_token', { path: '/' })
	  	.send({ status: 'account_deleted' });

	} catch (err) {
	    	req.log.error(err);
	    	reply.status(500).send(); //{ error: 'ACCOUNT_DELETE_FAILED' }
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
	    		`SELECT id, password_version, token_version FROM users WHERE id = ?`,
			[payload.userId],
			(err, row) => (err ? rej(err) : res(row))
		);
    	});

    	if (!user) return reply.status(401).send({ error: 'User not found' });

		return issueSession(user, reply);
});

// --- 2FA ---
fastify.post('/auth/2fa/setup', { preHandler: requireAuth }, async (req, reply) => {
	const id = (req as any).user.id;
	const db = getDB();

	const check = await new Promise<any>((res, rej) => {
		db.get(`SELECT twofa_enabled FROM users WHERE id = ?`, [id], (err, row) =>
			err ? rej(err) : res(row)
		);
	});

	if (check) {
		return reply.status(409).send(); // { error: '2FA already enabled' }
	}

	const result = await generate2FA(id);
	reply.send(result);
});

fastify.post('/auth/2fa/enable', { preHandler: requireAuth }, async (req, reply) => {
			 const { code } = req.body as { code: string };
			 const id = (req as any).user.id;
    	
		 	 const db = getDB();
    	
		 	 const row = await new Promise<any>((res, rej) => {
												db.get(`SELECT twofa_secret FROM users WHERE id = ?`, 
													   [id], 
													   (err, row) => (err ? rej(err) : res(row)));
												});

	 		 if (!row || !verify2FA(row.twofa_secret, code)) return reply.status(401).send(); //{ error: 'Invalid 2FA code' }

			 await new Promise((res, rej) => {
							   db.run(
								  	  `UPDATE users SET twofa_enabled = 1 WHERE id = ?`,
								  	  [id],
								  	  err => err ? rej(err) : res(true)
								   	 );
							   });

			 const result = await new Promise<any>((res, rej) => {
												   db.get(`SELECT email, twofa_enabled FROM users WHERE id = ?`,
														  [id],
														  (err, row) => (err ? rej(err) : res(row)));
												   });

			 if (!result) return reply.status(401).send();

	 		 reply.send({ id: id, email: result.email, twofa_enabled: result.twofa_enabled });
});

fastify.post('/auth/2fa/disable', { preHandler: requireAuth }, async (req, reply) => {
			 const { code } = req.body as { code: string };
             const id = (req as any).user.id;
	
		 	 const db = getDB();

		 	 const user = await new Promise<any>((res, rej) => {
										 		 db.get(`SELECT twofa_secret FROM users WHERE id = ?`,
										  				[id],
										  				(err, row) => (err ? rej(err) : res(row)));
											 	 });

		 	 if (!user || !verify2FA(user.twofa_secret, code)) {
	 		 return reply.status(401).send(); // { error: 'Invalid 2FA code' })
    	}

		 	 await new Promise((res, rej) => {
					   		   db.run(`UPDATE users SET twofa_enabled = 0, twofa_secret = NULL WHERE id = ?`,
							  		  [id],
						  			  (err) => (err ? rej(err) : res(true))
					   				 );
					   		   });

			 const result = await new Promise<any>((res, rej) => {
                                                   db.get(`SELECT email, twofa_enabled FROM users WHERE id = ?`,
                                                          [id],
                                                          (err, row) => (err ? rej(err) : res(row)));
                                                   });
				if (!result) return reply.status(401).send();

			 reply.send({ id: id, email: result.email, twofa_enabled: result.twofa_enabled });
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
	    		`SELECT id, username, password_version, token_version, twofa_secret FROM users WHERE id = ?`,
	    		[payload.sub],
	    		(err, row) => (err ? rej(err) : res(row))
		);
    	});

    	if (!user || !verify2FA(user.twofa_secret, code)) {
		return reply.status(401).send({ error: 'Invalid 2FA code' });
    	}

		return issueSession(user, reply);
});

// --- HEALTH ---
fastify.get('/health', async () => ({ status: 'ok', service: 'auth-service' }));

// --- START SERVER ---
const start = async () => {
    try {
        await initDB();
        console.log(chalk.green.bold('[auth] Database initialized'));
        await initTokenDB();
        console.log(chalk.green.bold('[auth] Refresh tokens database initialized'));
        await fastify.listen({ port: 8081, host: '0.0.0.0' });
        console.log(chalk.green.bold('[auth] Authentification is running on :8081'));
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
