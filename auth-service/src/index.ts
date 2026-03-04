import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import cookie from '@fastify/cookie';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { randomUUID } from 'crypto';
import { signup, login, generateEmail } from './auth';
import { initDB, getDB } from './db';
import { initTokenDB, getTokenDB } from './dbTokens';
import { privateKey, publicKey } from './keys';
import { generateToken, deleteUserSession } from './token';
import { createRefreshToken, verifyRefreshToken, revokeRefreshToken, revokeRefreshTokenById, isTokenRevoked } from './refresh';
import { hashPassword, verifyPassword } from './password';


const fastify = Fastify({ logger: true });

fastify.register(cookie, { secret: 'cookie-secret' });

const PROFILE_SERVICE_URL = process.env.PROFILE_SERVICE_URL ?? 'http://profile-service:5000';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN ?? 'secret';


const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    path: '/',
};

const refreshOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    path: '/auth/refresh',
    maxAge: 7 * 24 * 3600,
};


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
    '/auth/set-password',
    '/auth/logout'
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
            db.get(`SELECT id, email, password_version, twofa_enabled, token_version, deleted_at FROM users WHERE id = ?`,
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

// --- AUTH INTERNAL MIDDLEWARE ---
async function requireServiceAuth(req: any, reply: any) {

        const auth = req.headers.authorization;

        if (!auth) {
            return reply.status(401).send({ error: 'Missing auth' });
        }

        const token = auth.replace('Bearer ', '');

    /* TODO uncomment process.env.SERVICE_OKEN in prod */

    if (token !== SERVICE_TOKEN) {
//          if (token !== process.env.SERVICE_TOKEN) {
            return reply.status(403).send({ error: 'Forbidden' });
        }
}

// --- INTERNAL AUTH ROUTE ---
fastify.get<{ Params: { id: string } }>('/internal/auth/session_state/:id', { preHandler: requireServiceAuth }, async (req, reply) => {
  try {
    const userId = req.params.id;
    const db = getDB();

    const row = await new Promise<{ user_id: string; expires_at: string } | undefined>((resolve, reject) => {
      db.get(
        `SELECT user_id, expires_at FROM user_sessions WHERE user_id = ? LIMIT 1`,
        [userId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result as { user_id: string; expires_at: string } | undefined);
        }
      );
    });

    if (!row) {
      return reply.status(404).send({ error: 'Session not found' });
    }

    return reply.send({ exp: row.expires_at });

  } catch (err) {
    req.log.error(err, 'Error fetching session state');
    return reply.status(500).send({ error: 'SESSION_STATE_FAILED' });
  }
});

// --- SIGNUP ---
    fastify.post('/auth/signup', { preHandler: requireGuest }, async (req: any, reply) => {
        
        const { email, password } = req.body as AuthBody;
        //    const next = req.query.next || req.cookies?.last_page || '/me';
        
        if (!email || !password) {
            return reply.status(400).send({
                error: { code: 'VALIDATION_ERROR', message: 'Invalid input: username, email and password required' },
            });
        }
        
        try {
            const user = await signup(email, password);
            
            const token = await generateToken({ 
                id: user.id, 
                password_version: user.password_version || 1,
                token_version: user.token_version || 0
            });
            const csrfToken = randomUUID();
            const refreshToken = await createRefreshToken(user.id);
            
            reply
            .setCookie('access_token', token, { ...cookieOpts, maxAge: 3600 })
            .setCookie('refresh_token', refreshToken, refreshOpts)
            .setCookie('csrf_token', csrfToken, { httpOnly: false, secure: true, sameSite: 'none', path: '/' })
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
fastify.post('/auth/login', { preHandler: requireGuest }, async (req: any, reply) => {
    const { email, password } = req.body as LoginBody;
    if (!email || !password) return reply.status(400).send('Email and password required');
    
    try {
        const user = await login(email, password);
        
        const token = await generateToken({ 
            id: user.id, 
            password_version: user.password_version,
            token_version: user.token_version
        });
        const csrfToken = randomUUID();
        const refreshToken = await createRefreshToken(user.id);
        
        reply
        .setCookie('access_token', token, { ...cookieOpts, maxAge: 3600 })
        .setCookie('refresh_token', refreshToken, refreshOpts)
        .setCookie('csrf_token', csrfToken, { httpOnly: false, secure: true, sameSite: 'none', path: '/' })
        .status(201)
        .send({ 
            user: { 
                id: user.id, 
                email: user.email 
            } 
            });
        } catch (err: any) {
        reply.status(401).send({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    }
});

// --- CHANGE USER PASSWORD ---
fastify.post('/auth/password', { preHandler: requireAuth }, async (req: any, reply) => {
    const { old_password, new_password } = req.body as ChangePassword;
    
    console.log("Changing password...");
    // 1. Validaciones básicas
    if (!old_password || !new_password) {
        return reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: 'Missing fields' },
        });
    }

    if (new_password.length < 8) {
        return reply.status(400).send({
            error: { code: 'WEAK_PASSWORD', message: 'Password too short' },
        });
    } else if (new_password === old_password) {
        return reply.status(400).send({
            error: { code: 'SAME_PASSWORD', message: 'New password must be different' },
        });
    }

    const userId = req.user.id;
    const db = getDB();

    // 2. Obtener hash actual
    const user = await new Promise<DBUser | null>((resolve, reject) => {
        db.get(
            `SELECT password_hashed FROM users WHERE id = ?`,
            [userId],
            (err, row) => (err ? reject(err) : resolve(row as DBUser | null))
        );
    });
    
    console.info("Retrieve user:", user);
    if (!user) return reply.status(404).send();

    // 3. ✅ VALIDACIÓN CORRECTA: Comparamos la ANTIGUA contra el Hash
    const valid = await verifyPassword(old_password, user.password_hashed);
    
    if (!valid) {
        return reply.status(403).send({
            error: { code: 'CURRENT_PASSWORD_INCORRECT', message: 'Current password is incorrect' },
        });
    }

    // 4. Hashear nueva contraseña
    const newHash = await hashPassword(new_password);

    // 5. ✅ UPDATE CORREGIDO: Sintaxis SQL limpia
    await new Promise<void>((resolve, reject) => {
        db.run(
            `UPDATE users
             SET password_hashed = ?, 
                 password_version = password_version + 1, 
                 token_version = token_version + 1
             WHERE id = ?`,
            [newHash, userId],
            err => (err ? reject(err) : resolve())
        );
    });

    // 6. Revocar sesión antigua
    await revokeRefreshTokenById(userId);

	console.error("Password changed...");

    return reply.status(204).send();
});

//Logout less strinct accepts to logut even if token is not correct. 
fastify.post('/auth/logout', { preHandler: requireAuth }, async (req: any, reply) => {
    // Definimos las opciones exactas que usas en el login

	const controller = new AbortController();
	setTimeout(() => controller.abort(), 5000);

	const user = req.user;

    const cookieOptions = {
        path: '/',
        secure: true, 
        sameSite: 'none' as const, // Ajusta esto según tu config de login
        httpOnly: true
    };

    try {
        const refreshToken = req.cookies?.refresh_token;
        if (refreshToken) {
            const payload = await verifyRefreshToken(refreshToken).catch(() => null);
            if (payload) await revokeRefreshToken(payload.tokenId).catch(() => {});
        }

		await deleteUserSession(user.id);

		const res = await fetch(`${PROFILE_SERVICE_URL}/internal/profile/logout/${user.id}`, { headers: { Authorization: `Bearer ${SERVICE_TOKEN}`, }, signal: controller.signal, });

    } catch (err) { /* ignore */ }

    return reply
        // IMPORTANTE: El path del refresh_token suele ser diferente (/auth/refresh)
        .clearCookie('access_token', { ...cookieOptions, path: '/' })
        .clearCookie('refresh_token', { ...cookieOptions, path: '/auth/refresh' })
        .clearCookie('csrf_token', { ...cookieOptions, path: '/', httpOnly: false })
        .status(200) // Siempre devolvemos 200 para que el navegador procese el borrado
        .send({ status: 'logged_out' });
});

fastify.delete('/auth/deleteme', { preHandler: requireAuth }, async (req: any, reply) => {
      	const userId = req.user.id;
      	const db = getDB();
      	const dbToken = getTokenDB();
		const mockEmail = generateEmail();

		const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000);

        console.info("DB Token: ", dbToken);
      	try {
            // 1. Llamar al Profile Service para el borrado interno
            const profileRes = await fetch(`${PROFILE_SERVICE_URL}/internal/profile/delete`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SERVICE_TOKEN.trim()}` // No sé que poner aquí
                },
				body: JSON.stringify({ userId })
            });

            if (!profileRes.ok) {
                throw new Error('Could not delete profile data');
            }


	    	await new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // 1. Revocar tokens de refresco (en la otra DB)
                dbToken.run(`UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?`, [userId]);

                // 2. Borrar directamente (si el usuario no existe, this.changes será 0)
                db.run(`UPDATE users SET email = ?, password_version = password_version + 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [mockEmail, userId], function (err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }
                    if (this.changes === 0) {
                        db.run('ROLLBACK');
                        return reject(new Error('User not found in database'));
                    }
                    db.run('COMMIT');
                    resolve();
                });
            });
        });

		await deleteUserSession(userId);

		const res = await fetch(`${PROFILE_SERVICE_URL}/internal/profile/logout/${userId}`, { headers: { Authorization: `Bearer ${SERVICE_TOKEN}`, }, signal: controller.signal, });
		// 4. Clear cookies
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

		await deleteUserSession(payload.userId);

    	const db = getDB();
    	const user = await new Promise<any>((res, rej) => {
		db.get(
	    		`SELECT id, username, password_version, token_version FROM users WHERE id = ?`,
			[payload.userId],
			(err, row) => (err ? rej(err) : res(row))
		);
    	});

    	if (!user) return reply.status(401).send({ error: 'User not found' });

    	const newAccess = await generateToken({
		id: user.id,
		password_version: user.password_version,
		token_version: user.token_version,
    	});

    	const newRefresh = await createRefreshToken(user.id);
    	const csrfToken = randomUUID();

    	reply
	.setCookie('access_token', newAccess, { ...cookieOpts, maxAge: 3600 })
	.setCookie('refresh_token', newRefresh, refreshOpts)
	.setCookie('csrf_token', csrfToken, {
    		httpOnly: false,
		secure: true,
    		sameSite: 'none',
    		path: '/',
	})
	.send({ ok: true });
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
