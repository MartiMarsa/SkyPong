import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { access, unlink, constants } from 'fs/promises';
import chalk from 'chalk';
import { initProfileDB, getProfileDB } from './dbPlayers';
import { 
  getPlayerById, 
  createPlayer, 
  updatePlayerInfo, 
  ensureAvatarIsAlive,
  updatePlayerAvatar,
  updatePlayerOnlineStatus, 
  updatePlayerStats,
  getLeaderboard,
  softdeletePlayer,
  getUserPublicProfile 
} from './player';
import * as friendService from './friendService';
import { publicKey } from './keys';

const fastify = Fastify({logger: true});

// Registrar el plugin de métricas
fastify.register(require('fastify-metrics'), { 
  endpoint: '/metrics', // La ruta que ya sabemos que busca Prometheus
  defaultMetrics: { enabled: true }, // Métricas del sistema (CPU, RAM, Event Loop)
  routeMetrics: { enabled: true }    // Métricas de tus rutas (peticiones/segundo, latencia)
});

/* TODO CHANGE SERVICE_TOKEN to env in prod*/
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'secret';

// --- DDOS PROTECTION VIA FILE SIZE <= 2 MB ---
fastify.register(multipart, {
      	limits: {
	    	fileSize: 2 * 1024 * 1024
      	}
})

// --- ALLOWED IMAGE FILE TYPES ---
const ALLOWED_MIME = [
      	'image/png',
      	'image/jpeg',
      	'image/webp'
]

// --- TYPES ---
interface Player {
		id: string;
		nickname: string;
		avatar?: string;
}

/*
fastify.register(fastifyStatic, {
      	root: path.join(process.cwd(), 'uploads'),
      	prefix: '/static/'
});
*/
declare module 'fastify' {
  interface FastifyRequest {
    user: {
      sub: string;             // Este es el user.id
      pv: number | string;     // Password version
      tv: number | string;     // Token version
      iss: string;             // Issuer (auth-service)
      aud: string;             // Audience (transcendence)
    }
  }
}


fastify.get('/healthz', async (request, reply) => {
  return { status: 'ok' };
});

// --- PROFILE INTERNAL MIDDLEWARE ---
async function requireServiceAuth(req: any, reply: any) {

      	const auth = req.headers.authorization;

      	if (!auth) {
	    	return reply.status(401).send({ error: 'Missing auth' });
      	}

      	const token = auth.replace('Bearer ', '');

	/* TODO uncomment process.env.SERVICE_OKEN in prod */

	if (token !== SERVICE_TOKEN) {
//      	if (token !== process.env.SERVICE_TOKEN) {
	    	return reply.status(403).send({ error: 'Forbidden' });
      	}
}

fastify.register(require('@fastify/cookie'), {
});

async function verifyToken(req: any, reply: any) {

	const accessToken = req.cookies?.access_token;

    console.info("------> Verifiying accestoken:", accessToken);
	if (!accessToken) {
		return reply.status(401).send({error: "No access token"});
    }

    try {
        const verified = jwt.verify(accessToken, 
                                    publicKey, 
                                    { 
                                        algorithms: ['RS256'],
                                        issuer: 'auth-service',
                                        audience: 'transcendence',
                                        }) as any;

        req.user = verified;
        console.info("----> Access Token Verified:", verified);
        console.info("----> req.user set to:", req.user); 
        return;
    } catch (err) {
        console.error('Error verifying access token:', err);
        return reply.status(403).send({ error: "Invalid Token"});
    }
}
// --- INTERNAL PROFILE ROUTE ---
fastify.get<{ Params: { id: string } }>('/internal/profile/by-user-id/:id',  { preHandler: requireServiceAuth }, async (req, reply) => {
	try {
			const userId = req.params.id;

			let player: Player | null = await getPlayerById(userId) as Player | null;

			if (!player) {
				player = await createPlayer(userId) as Player;
				} else { 
				const logged = true;
				await updatePlayerOnlineStatus(userId, logged); }

		  	return reply.send({ nickname: player.nickname, });
			} catch (err) {
	  			req.log.error(err, 'Error fetching/creating player');
		  		return reply.status(500).send();
    
				}
});

fastify.get<{ Params: { id: string } }>('/internal/profile/logout/:id', { preHandler: requireServiceAuth }, async (req, reply) => {
	try {
			const userId = req.params.id;
			const logged = false;
			await updatePlayerOnlineStatus(userId, logged);
	} 
	catch (err) {
		req.log.error(err, 'Error user logout');
		return reply.status(500).send();		
	}
										});

// --- PUBLIC PROFILE USER ---
fastify.get('/profile/me', { preHandler: verifyToken }, async (req, reply) => {
    console.info("!!!!! HANDLER REACHED !!!!!"); // ¿aparece esto en los logs?
    console.info("----> req.user in handler:", req.user);
	try {
        const userId = req.user?.sub;

        console.info("User /me:", req.user);
        if (!userId) {
            return reply.status(401).send("User not found.");
        }

        //This is private user info so can return all info
		let player = await getPlayerById(userId);
        console.info("Player /me:", player);

	  // create new player if it was authorized (signup), but no profile in database
		if (!player) {
            console.info("Creating new player for user:", userId);
            player = await createPlayer(userId);
      	}

		await ensureAvatarIsAlive(userId, player.avatarUrl);

        console.info("----> Sending player profile info: ", player);
		return reply.send(player 
        );
	} catch (err: any) {

		fastify.log.error(err);
        req.log.error(err);
        return reply.status(500).send({ error: "Internal Server Error" });
	  }
});


// --- PUBLIC PROFILE ---
fastify.get('/profile/:id', {preHandler: verifyToken }, async (req, reply) => {

			const { id } = req.params as { id: string};

			const user = await getUserPublicProfile(id);

			if (!user) {
				return reply.status(404).send({
				  	error: { 
							code: "USER_NOT_FOUND", 
							message: "User not found" 
					}
	    		});
			}

			await ensureAvatarIsAlive(user.id, user.avatarUrl);

			return { user };
});

// --- PRIVATE CHANGE PROFILE ---
fastify.patch('/profile/updateme', { preHandler: verifyToken }, async (req, reply) => {
    try {
        const userId = req.user.sub;
        const data = req.body as any;

        // 1. Actualizamos
        await updatePlayerInfo(userId, data);

        // 2. Buscamos el usuario actualizado (usa la función que ya tengas para GET profile)
        const updatedUser = await getPlayerById(userId); 

        // 3. Devolvemos el objeto completo
        return reply.send({ 
            status: 'Player info updated', 
            user: updatedUser 
        });

    } catch (err: any) {
        fastify.log.error(err);
        reply.status(500).send();
    } 
});

// --- UPDATE USER STATS ---
fastify.post('/internal/profile/gameresult/update', { preHandler: requireServiceAuth }, async (req: any, reply) => {

	const res = req.body as {
	    	game_id: string;
	    	players: {
		  	user_id: string;
		  	result: 'win' | 'loss';
	    	}[];
      	};

      	if (!res.game_id || !res.players || res.players.length !== 2) {    return reply.status(400).send({ error: 'Invalid payload' });
      	}

	const [p1, p2] = res.players;

	if (
		!p1.user_id || !p2.user_id ||
		!['win', 'loss'].includes(p1.result) ||
		!['win', 'loss'].includes(p2.result)
	) {
		return reply.code(400).send({ error: 'Invalid players' });
    	}

	if (p1.result === p2.result) {
	  	return reply.code(400).send({ error: 'Invalid match result' });
    	}

	try {
		const result = await updatePlayerStats(res.game_id, p1, p2);
		
		if (!result.applied) {
	  		return reply.status(400).send({ error: 'One or both players not found in profile' });
		}

		reply.send({ status: 'ok', rate: result.rate });

	} catch (err) {
		req.log.error(err);
		reply.status(500).send({ error: 'PROFILE_STATS_UPDATE_FAILED'});
	}
});

// --- GET UPDATED LEADERBOARD ---
fastify.get('/internal/profile/leaderboard/updates', { preHandler: requireServiceAuth }, async (req: any, reply) => {

    	const since = req.query?.since || '2025-12-01';

	try {
		const leaderboard = await getLeaderboard(since);
	      	reply.send(leaderboard);
	} catch (err) {
		req.log.error(err);
		reply.status(500).send({ error: 'LEADERBOARD_UPDATE_FAILED'});
	}
});


// --- DELETE PROFILE ---
fastify.post('/internal/profile/delete', { preHandler: requireServiceAuth }, async (req: any, reply) => {

		console.info("-----> REQUEST", req);
    	const { userId  } = req.body as { userId: string };

		console.info("----> USER ID: ", userId);

    	if (!userId) {
	  	return reply.status(400).send({ error: 'userId required' });
    	}

        const path = require('path');
		const AVATAR_DIR = AVATARS_DIR;
//        const AVATAR_DIR = '/app/uploads/avatars/'; // O la ruta donde guardes físicamente los archivos

        const filePath = path.join(AVATAR_DIR, `${userId}.webp`);
        try {
            await softdeletePlayer(userId);

            // Verificamos si el archivo existe antes de intentar borrarlo
            try {
                await access(filePath, constants.F_OK);
                await unlink(filePath);
            } catch (fsErr) {
                // Si el archivo no existe, simplemente ignoramos el error y seguimos
                req.log.warn(`No avatar found for user ${userId}, skipping file deletion.`);
            }

            reply.send({ status: 'profile_deleted' });

    	} catch (err) {

	  	req.log.error(err);

	  	reply.status(500).send({
			error: 'PROFILE_DELETE_FAILED'
	  	});
    	}
});


// Use profile-service volume to persist avatars
//const AVATARS_DIR = process.env.AVATARS_PATH || path.join(process.cwd(), 'uploads', 'avatars');
const AVATARS_DIR = path.join('/app/uploads', 'avatars');
const DEFAULT_AVATAR_PATH = path.join('/app/static', 'default-avatar.webp');

// Creates service image directory
(async () => {
  try {
    await fs.mkdir(AVATARS_DIR, { recursive: true });
    console.log(`✅ Avatars directory ready: ${AVATARS_DIR}`);
  } catch (error) {
    console.error('Error creating avatars directory:', error);
  }
})();
// --- CHANGE PROFILE AVATAR ---
fastify.post('/profile/avatar', { preHandler: verifyToken }, async (req, reply) => {
    try {
        const userId = req?.user?.sub;
        console.info("Trying to upload avatar from", userId);
        
        if (!userId || typeof userId !== 'string') {
            return reply.status(401).send({ error: 'Unauthorized' });
        }

        const file = await req.file();
        console.info("File:", file);
        
        if (!file) {
            return reply.status(400).send({ error: 'No file uploaded' });
        }

        if (!ALLOWED_MIME.includes(file.mimetype)) {
            return reply.status(400).send({
                error: 'Only PNG, JPG, WebP allowed'
            });
        }

        const buffer = await file.toBuffer();

        // Valida la imagen
        let meta;
        try {
            meta = await sharp(buffer).metadata();
        } catch {
            return reply.status(400).send({
                error: 1 //Invalid image file
            });
        }

        if (!meta.format || !['png', 'jpeg', 'webp'].includes(meta.format)) {
            return reply.status(400).send({
                error: 1 //Invalid image format
            });
        }

        // Procesa la imagen
        const avatar = await sharp(buffer)
            .resize(256, 256, {
                fit: 'cover',
                position: 'center'
            })
            .toFormat('webp', {
                quality: 80
            })
            .toBuffer();

        // ✅ CORRECCIÓN: Guarda en el volumen persistente
        console.log("Uploading Avatar to:", AVATARS_DIR);
        
		const filePath = path.join(AVATARS_DIR, `${userId}.webp`);
		await fs.writeFile(filePath, avatar);
        
        console.log("✅ Avatar saved at:", filePath);

        // ✅ URL pública del avatar
		const avatarUrl = `/api/profile/avatars/${userId}.webp`;

        // Actualiza en la base de datos
        await updatePlayerAvatar(userId, avatarUrl);

        return reply.status(200).send({
            success: true,
            avatar: avatarUrl
        });
        
    } catch (err: any) {
        console.error('Error uploading avatar:', err);
        return reply.status(500).send({ 
            error: err.code || 'UPLOAD_ERROR', 
            message: err.message || 'Failed to upload avatar'
        });
    }
});

fastify.get('/profile/avatars/:filename', async (req, reply) => {
  try {
    const { filename } = req.params as { filename: string };

    if (
      !filename.endsWith('.webp') ||
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      return reply.status(400).send({ error: 'Invalid filename' });
    }

    const userAvatarPath = path.join(AVATARS_DIR, filename);

    try {
      await fs.access(userAvatarPath);

      return reply
        .type('image/webp')
        .header('Cache-Control', 'public, max-age=3600')
        .send(await fs.readFile(userAvatarPath));

    } catch {
      // fallback → default avatar

	  const userId = filename.replace('.webp', '');
      await ensureAvatarIsAlive(userId, DEFAULT_AVATAR_PATH);

      return reply
        .type('image/png')
        .header('Cache-Control', 'public, max-age=86400')
        .send(await fs.readFile(DEFAULT_AVATAR_PATH));
    }

  } catch (error) {
    console.error('Error serving avatar:', error);
    return reply.status(500).send({ error: 'Failed to serve avatar' });
  }
});

/*
fastify.get('/profile/avatars/:filename', async (req, reply) => {
    try {
        const { filename } = req.params as { filename: string };

        if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return reply.status(400).send({ error: 'Invalid filename' });
        }

        if (!filename.endsWith('.webp')) {
            return reply.status(400).send({ error: 'Invalid file type' });
        }

        const filePath = path.join(AVATARS_DIR, filename);

        try {
            await fs.access(filePath);
        } catch {
            console.warn('Avatar not found:', filePath);
            
            const defaultFilePath = path.join(AVATARS_DIR, 'default-avatar.webp');
            const defaultFileBuffer = await fs.readFile(defaultFilePath);
            return reply.type('image/webp')
            .header('Cache-Control', 'public, max-age=3600')
            .send(defaultFileBuffer);
        }

        const fileBuffer = await fs.readFile(filePath);
        
        return reply
            .type('image/webp')
            .header('Cache-Control', 'public, max-age=3600') // Cache 1 hora
            .send(fileBuffer);
            
    } catch (error) {
        console.error('Error serving avatar:', error);
        return reply.status(500).send({ error: 'Failed to serve avatar' });
    }
});
*/

fastify.addHook('onRequest', async (request, reply) => {
  console.log(`Recibida petición: ${request.method} ${request.url}`);
});



// GET friends
fastify.get('/profile/friends', { preHandler: verifyToken }, async (req, reply) => {
    const userId = req.user.sub;

	try {
        const friends = await friendService.getFriendsService(userId);
        console.log('--->>> FROM /profile/friends');
		console.log(`\n=== Friends for user ${userId} ===`);
        friends.forEach(friend => {
            console.log(`- ${friend.nickname} (ID: ${friend.user_id})`);
            console.log(`  Avatar: ${friend.avatarUrl}`);
            console.log(`  Last access: ${friend.last_access_at}`);
            console.log(`  Logged: ${friend.logged}`);
        });
        console.log('=== End of friends list ===\n');
        return friends;
    } catch (err) {
        console.error('Error fetching friends:', err);
        reply.status(500).send({ error: 'Failed to fetch friends' });
    }
//    return friendService.getFriendsService(userId);
});

// GET friends of target
fastify.get('/profile/friends/:targetId', { preHandler: verifyToken }, async (req, reply) => {
    const userId = req.user.sub;
	const { targetId } = req.params as { targetId: string};

	try {
        const friends = await friendService.getFriendsOfTargetService(userId, targetId);
        console.log('--- >>>> FROM /profile/friends/:targetId: Friends for user');
		console.log(`\n=== Friends for user ${userId} ===`);
        friends.forEach(friend => {
            console.log(`- ${friend.nickname} (ID: ${friend.user_id})`);
            console.log(`  Avatar: ${friend.avatarUrl}`);
            console.log(`  Last access: ${friend.last_access_at}`);
            console.log(`  Logged: ${friend.logged}`);
        });
        console.log('=== End of friends list ===\n');
        return friends;
    } catch (err) {
        console.error('Error fetching friends:', err);
        reply.status(500).send({ error: 'Failed to fetch friends' });
    }


//    return friendService.getFriendsOfTargetService(userId, targetId);
});

// GET incoming requests
fastify.get('/profile/friends/requests/incoming', { preHandler: verifyToken }, async (req, reply) => {
    const userId = req.user.sub;
    return friendService.getIncomingRequestsService(userId);
});

// GET outgoing requests
fastify.get('/profile/friends/requests/outgoing', { preHandler: verifyToken }, async (req, reply) => {
    const userId = req.user.sub;
    return friendService.getOutgoingRequestsService(userId);
});

// SEND request
fastify.post('/profile/friends/:toId', { preHandler: verifyToken }, async (req, reply) => {
    const fromId = req.user.sub;
    const { toId } = req.params as { toId: string };
    try {
        await friendService.sendFriendRequestService(fromId, toId);
        return { success: true };
    } catch (err: any) {
        return reply.status(400).send({ error: { code: err.message, message: err.message } });
    }
});

// ACCEPT
fastify.post('/profile/friends/:requesterId/accept', { preHandler: verifyToken }, async (req, reply) => {
    const userId = req.user.sub;
    const { requesterId } = req.params as { requesterId: string };
    try {
        await friendService.acceptFriendRequestService(userId, requesterId);
        return { success: true };
    } catch (err: any) {
        return reply.status(400).send({ error: { code: err.message, message: err.message } });
    }
});

// REJECT
fastify.post('/profile/friends/:requesterId/reject', { preHandler: verifyToken }, async (req, reply) => {
    const userId = req.user.sub;
    const { requesterId } = req.params as { requesterId: string };
    try {
        await friendService.rejectFriendRequestService(userId, requesterId);
        return { success: true };
    } catch (err: any) {
        return reply.status(400).send({ error: { code: err.message, message: err.message } });
    }
});

// CANCEL
fastify.post('/profile/friends/:requesterId/cancel', { preHandler: verifyToken }, async (req, reply) => {
    const userId = req.user.sub;
    const { requesterId } = req.params as { requesterId: string };
    try {
        await friendService.cancelFriendRequestService(userId, requesterId);
        return { success: true };
    } catch (err: any) {
        return reply.status(400).send({ error: { code: err.message, message: err.message } });
    }
});

// REMOVE
fastify.delete('/profile/friends/:friendId', { preHandler: verifyToken }, async (req, reply) => {
    const userId = req.user.sub;
    const { friendId } = req.params as { friendId: string };
    console.info("For Player ", userId, " remove ", friendId);
    try {
        await friendService.removeFriendService(userId, friendId);
        return { success: true };
    } catch (err: any) {
        return reply.status(400).send({ error: { code: err.message, message: err.message } });
    }
});

// BLOCK
fastify.post('/profile/friends/:targetId/block', { preHandler: verifyToken }, async (req, reply) => {
    const userId = req.user.sub;
    const { targetId } = req.params as { targetId: string };
    console.info("---->>> For Player ", userId, " blocks ", targetId);
    try {
        await friendService.blockUserService(userId, targetId);
        return { success: true };
    } catch (err: any) {
        return reply.status(400).send({ error: { code: err.message, message: err.message } });
    }
});

// UNBLOCK
fastify.post('/profile/friends/:targetId/unblock', { preHandler: verifyToken }, async (req, reply) => {
    const userId = req.user.sub;
    const { targetId } = req.params as { targetId: string };
    try {
        await friendService.unblockUserService(userId, targetId);
        return { success: true };
    } catch (err: any) {
        return reply.status(400).send({ error: { code: err.message, message: err.message } });
    }
});


// Get Friend Status
fastify.get('/profile/friends/status/:targetId', { preHandler: verifyToken }, async (req, reply) => {
    const userId = req.user.sub;
    const { targetId } = req.params as { targetId: string };
    const status = await friendService.getFriendStatusService(userId, targetId);
    return status ?? { status: null };
});
// // --- SEND FRIEND REQUEST ---
// fastify.post('/profile/friends/:toId', async (req, reply) => {
//     	const fromId = req.headers['x-user-id'] as string;
//     	const { toId } = req.params as { toId: string };
//     	try {
// 	  	await friendService.sendFriendRequestService(fromId, toId);
// 	  	return { success: true };
//     	} catch (err: any) {
// 	  	return reply.status(400).send({ 
// 			error: { 
// 				code: err.message, 
// 				message: err.message } 
		
// 		});
//     	}
// });

// // --- ACCEPT FRIEND REQUEST ---
// fastify.post('/profile/friends/:requesterId/accept', async (req, reply) => {
//     	const userId = req.headers['x-user-id'] as string;
//     	const { requesterId } = req.params as { requesterId: string };
//     	try {
// 	  	await friendService.acceptFriendRequestService(userId, requesterId);
// 	  	return { success: true };
//     	} catch (err: any) {
// 	  	return reply.status(400).send({ 
// 			error: { 
// 				code: err.message, 
// 				message: err.message }
// 		});
//     	}
// });

// // --- REJECT FRIEND REQUEST ---
// fastify.post('/profile/friends/:requesterId/reject', async (req, reply) => {
//     	const userId = req.headers['x-user-id'] as string;
//     	const { requesterId } = req.params as { requesterId: string };
//     	try {
// 	  	await friendService.rejectFriendRequestService(userId, requesterId);
// 	  	return { success: true };
//     	} catch (err: any) {
// 	  	return reply.status(400).send({ 
// 			error: { 
// 				code: err.message, 
// 				message: err.message } 
// 		});
//     	}
// });

// // --- CANCEL OUTGOING FRIEND REQUEST ---
// fastify.post('/profile/friends/:requesterId/cancel', async (req, reply) => {
//     	const userId = req.headers['x-user-id'] as string;
//     	const { requesterId } = req.params as { requesterId: string };
//     try {
// 	    await friendService.cancelFriendRequestService(userId, requesterId);
//       	    return { success: true };
//     } catch (err: any) {
//       	    return reply.status(400).send({ 
// 		    error: { 
// 			    code: err.message, 
// 			    message: err.message }
// 	    });
//     }
// });

// // --- REMOVE FRIEND ---
// fastify.delete('/profile/friends/:friendId', async (req, reply) => {
//     	const userId = req.headers['x-user-id'] as string;
//     	const { friendId } = req.params as { friendId: string };
//     	try {
// 	  	await friendService.removeFriendService(userId, friendId);
// 	  	return { success: true };
// 	} catch (err: any) {
// 	  	return reply.status(400).send({ 
// 			error: { 
// 				code: err.message, 
// 				message: err.message }
// 		});
//     	}
// });

// // --- BLOCK USER ---
// fastify.post('/profile/friends/:targetId/block', async (req, reply) => {
//     	const userId = req.headers['x-user-id'] as string;
//     	const { targetId } = req.params as { targetId: string };
//     	try {
// 	  	await friendService.blockUserService(userId, targetId);
// 	  	return { success: true };
//     	} catch (err: any) {
// 	  	return reply.status(400).send({ 
// 			error: { 
// 				code: err.message, 
// 				message: err.message }
// 		});
//     	}
// });

// // --- UNBLOCK USER ---
// fastify.post('/profile/friends/:targetId/unblock', async (req, reply) => {
//     	const userId = req.headers['x-user-id'] as string;
//     	const { targetId } = req.params as { targetId: string };
//     	try {
// 	  	await friendService.unblockUserService(userId, targetId);
// 	  	return { success: true };
//     	} catch (err: any) {
// 	  	return reply.status(400).send({ 
// 			error: { 
// 				code: err.message, 
// 				message: err.message }
// 		});
//     	}
// });

// // --- GET FRIEND LIST ---
// fastify.get('/profile/friends', async (req, reply) => {
//         const userId = req.user.sub;
//         console.info("GET /friends for userId:", userId);
//     	const result = await friendService.getFriendsService(userId);
//         console.info("Friends result:", result); 
//         return result;
// });

// // --- GET INCOMING FRIEND REQUESTS ---
// fastify.get('/profile/friends/requests/incoming', async (req, reply) => {
//     	const userId = req.headers['x-user-id'] as string;
//     	return friendService.getIncomingRequestsService(userId);
// });

// // --- GET OUTGOING FRIEND REQUESTS ---
// fastify.get('/profile/friends/requests/outgoing', async (req, reply) => {
//     	const userId = req.headers['x-user-id'] as string;
//     	return friendService.getOutgoingRequestsService(userId);
// });

// // --- GET BLOCK LIST ---
// fastify.get('/profile/friends/blocked', async (req, reply) => {
//     	const userId = req.headers['x-user-id'] as string;
//     	return friendService.getBlocklistService(userId);
// });

// // --- GET FRIEND STATUS ---
// fastify.get('/profile/friends/:otherId/status', async (req, reply) => {
//     	const userId = req.headers['x-user-id'] as string;
//     	const { otherId } = req.params as { otherId: string };
//     	return friendService.getFriendStatusService(userId, otherId);
// });

// --- START SERVER ---
const start = async () => {
	try {
	      await initProfileDB();
	      console.log(chalk.green.bold('[profile] Database initialized'));
	      await fastify.listen({ port: 5000, host: '0.0.0.0' });
	      console.log(chalk.green.bold('[profile] Player service is running on :5000'));
	} catch(err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
