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
  updatePlayerAvatar, 
  updatePlayerStats,
  getLeaderboard,
  softdeletePlayer,
  getUserPublicProfile 
} from './player';
import * as friendService from './friendService';
import { publicKey } from './keys';

const fastify = Fastify({logger: true});

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


fastify.register(fastifyStatic, {
      	root: path.join(process.cwd(), 'uploads'),
      	prefix: '/static/'
});

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

async function verifyToken(req: any, reply: any) {

	const accessToken = req.cookies?.access_token;

	if (!accessToken) {
		return reply.status(401).send();
    }

	if (accessToken) {
		try {
			const verified = jwt.verify(accessToken, 
										publicKey, 
										{ 
											algorithms: ['RS256'],
											issuer: 'auth-service',
											audience: 'transcendence',
											}) as any;

			req.user = verified;
			return;

		} catch (err) {
			console.error('Error verifying access token:', err);
			return reply.status(403).send();
		}
	}
}
// --- INTERNAL PROFILE ROUTE ---
fastify.get<{ Params: { id: string } }>('/internal/profile/by-user-id/:id',  { preHandler: requireServiceAuth }, async (req, reply) => {
	try {
			const userId = req.params.id;

			let player: Player | null = await getPlayerById(userId) as Player | null;

			if (!player) {
				player = await createPlayer(userId) as Player;
				}

		  	return reply.send({ nickname: player.nickname, });
			} catch (err) {
	  			req.log.error(err, 'Error fetching/creating player');
		  		return reply.status(500).send();
    
				}
});


// --- PRIVATE PROFILE ---
fastify.get('/profile/me', { preHandler: verifyToken }, async (req, reply) => {
	try {
	      	const userId = req.user.sub;

	      	if (!userId) {
		    	return reply.status(401).send();
	      	}

		if (typeof userId !== 'string') {
			return reply.status(401).send();
		}
		
		let player = await getPlayerById(userId);

	  // create new player if it was authorized (signup), but no profile in database
		if (!player) {
      			player = await createPlayer(userId);
      		}

		return reply.send(player);
	} catch (err: any) {

		fastify.log.error(err);
		reply.status(500).send();
	  }
});

// --- CHANGE PROFILE ---
fastify.patch('/profile/me', { preHandler: verifyToken }, async (req, reply) => {
	try {
		const userId = req.user.sub;

		if (!userId) {
		    	return reply.status(401).send();
	      	}

		if (typeof userId !== 'string') {
			return reply.status(401).send();
		}

		const data = req.body as any;

		await updatePlayerInfo(userId, data);

		return reply.send({ status: 'Player info updated' });


	} catch (err: any) {

		if (err?.code === 'SQLITE_CONSTRAINT') {
			return reply.status(409).send();
	    	}

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
		await updatePlayerStats(res.game_id, p1, p2);
		reply.send({ status: 'ok'});
	} catch (err) {
		req.log.error(err);
		reply.status(500).send({ error: 'PROFILE_STATS_UPDATE_FAILED'});
	}
});

// --- GET UPDATED LEADERBOARD ---
fastify.get('/internal/profile/leaderboard/updates', { preHandler: requireServiceAuth }, async (req: any, reply) => {

    	const since = req.query?.since || '2026-01-01';

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

    	const { userId  } = req.body;

    	if (!userId) {
	  	return reply.status(400).send({ error: 'userId required' });
    	}

	const avatarUrl = `/static/avatars/${userId}.webp`;

    	try {
		await softdeletePlayer(userId);

		await access(avatarUrl, constants.F_OK);
		await unlink(avatarUrl);

	  	reply.send({ status: 'profile_deleted' });

    	} catch (err) {

	  	req.log.error(err);

	  	reply.status(500).send({
			error: 'PROFILE_DELETE_FAILED'
	  	});
    	}
});

// --- CHANGE PROFILE AVATAR ---
fastify.post('/profile/me/avatar', { preHandler: verifyToken }, async (req, reply) => {
			 try {
			 const userId = req?.user.sub;

	 		 if (!userId) {
 			 return reply.status(401).send();
	 		 }

	 		 if (typeof userId !== 'string') {
 			 return reply.status(401).send();
	 		 }

	 		 const file = await req.file();

	 		 if (!file) {
	 		 return reply.status(400).send();
	 		 }
		
		if (!ALLOWED_MIME.includes(file.mimetype)) {
		  	return reply.status(400).send({
				error: 'Only PNG, JPG, WebP allowed'
		  	});
	    	}
		
		const buffer = await file.toBuffer();

		let meta;

	    	try {
		  	meta = await sharp(buffer).metadata();
	    	} catch {
		  	return reply.status(400).send({
				error: 'Invalid image file'
		  	});
	    	}

	    	if (!meta.format || !['png', 'jpeg', 'webp'].includes(meta.format)) {
		  	return reply.status(400).send({
				error: 'Invalid image format'
		  	});
	    	}

		const avatar = await sharp(buffer)
	  	.resize(256, 256, {
			fit: 'cover',
			position: 'center'
	  	})
	  	.toFormat('webp', {
			quality: 80
	  	})
	  	.toBuffer();


		const uploadDir = path.join(
		  	process.cwd(),
		  	'uploads',
		  	'avatars'
	    	);

	    	await fs.mkdir(uploadDir, { recursive: true });

	    	const filePath = path.join(uploadDir, `${userId}.webp`);

	    	await fs.writeFile(filePath, avatar);

		const avatarUrl = `/static/avatars/${userId}.webp`;

	    	await updatePlayerAvatar(userId, avatarUrl);

			return reply.status(200).send({
											success: true,
											avatar: avatarUrl
											});
		 	 } catch (err: any) {
		 		 reply.send({ error: err.code, message: err.message });

	 		 }
});

fastify.addHook('onRequest', async (request, reply) => {
  console.log(`Recibida petición: ${request.method} ${request.url}`);
});

// --- PUBLIC PROFILE ---
fastify.get('/profile/users/:id', async (req, reply) => {

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

      	return { user };
});

// --- SEND FRIEND REQUEST ---
fastify.post('/profile/friends/:toId', async (req, reply) => {
    	const fromId = req.headers['x-user-id'] as string;
    	const { toId } = req.params as { toId: string };
    	try {
	  	await friendService.sendFriendRequestService(fromId, toId);
	  	return { success: true };
    	} catch (err: any) {
	  	return reply.status(400).send({ 
			error: { 
				code: err.message, 
				message: err.message } 
		
		});
    	}
});

// --- ACCEPT FRIEND REQUEST ---
fastify.post('/profile/friends/:requesterId/accept', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	const { requesterId } = req.params as { requesterId: string };
    	try {
	  	await friendService.acceptFriendRequestService(userId, requesterId);
	  	return { success: true };
    	} catch (err: any) {
	  	return reply.status(400).send({ 
			error: { 
				code: err.message, 
				message: err.message }
		});
    	}
});

// --- REJECT FRIEND REQUEST ---
fastify.post('/profile/friends/:requesterId/reject', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	const { requesterId } = req.params as { requesterId: string };
    	try {
	  	await friendService.rejectFriendRequestService(userId, requesterId);
	  	return { success: true };
    	} catch (err: any) {
	  	return reply.status(400).send({ 
			error: { 
				code: err.message, 
				message: err.message } 
		});
    	}
});

// --- CANCEL OUTGOING FRIEND REQUEST ---
fastify.post('/profile/friends/:requesterId/cancel', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	const { requesterId } = req.params as { requesterId: string };
    try {
	    await friendService.cancelFriendRequestService(userId, requesterId);
      	    return { success: true };
    } catch (err: any) {
      	    return reply.status(400).send({ 
		    error: { 
			    code: err.message, 
			    message: err.message }
	    });
    }
});

// --- REMOVE FRIEND ---
fastify.delete('/profile/friends/:friendId', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	const { friendId } = req.params as { friendId: string };
    	try {
	  	await friendService.removeFriendService(userId, friendId);
	  	return { success: true };
	} catch (err: any) {
	  	return reply.status(400).send({ 
			error: { 
				code: err.message, 
				message: err.message }
		});
    	}
});

// --- BLOCK USER ---
fastify.post('/profile/friends/:targetId/block', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	const { targetId } = req.params as { targetId: string };
    	try {
	  	await friendService.blockUserService(userId, targetId);
	  	return { success: true };
    	} catch (err: any) {
	  	return reply.status(400).send({ 
			error: { 
				code: err.message, 
				message: err.message }
		});
    	}
});

// --- UNBLOCK USER ---
fastify.post('/profile/friends/:targetId/unblock', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	const { targetId } = req.params as { targetId: string };
    	try {
	  	await friendService.unblockUserService(userId, targetId);
	  	return { success: true };
    	} catch (err: any) {
	  	return reply.status(400).send({ 
			error: { 
				code: err.message, 
				message: err.message }
		});
    	}
});

// --- GET FRIEND LIST ---
fastify.get('/profile/friends', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	return friendService.getFriendsService(userId);
});

// --- GET INCOMING FRIEND REQUESTS ---
fastify.get('/profile/friends/requests/incoming', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	return friendService.getIncomingRequestsService(userId);
});

// --- GET OUTGOING FRIEND REQUESTS ---
fastify.get('/profile/friends/requests/outgoing', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	return friendService.getOutgoingRequestsService(userId);
});

// --- GET BLOCK LIST ---
fastify.get('/profile/friends/blocked', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	return friendService.getBlocklistService(userId);
});

// --- GET FRIEND STATUS ---
fastify.get('/profile/friends/:otherId/status', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	const { otherId } = req.params as { otherId: string };
    	return friendService.getFriendStatusService(userId, otherId);
});

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
