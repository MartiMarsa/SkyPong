import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { access, unlink } from 'fs/promises';
import chalk from 'chalk';
import { initProfileDB, getProfileDB } from './dbPlayers';
import { 
  getPlayerById, 
  createPlayer, 
  updatePlayerInfo, 
  updatePlayerAvatar, 
  updatePlayerStats,
  softdeletePlayer,
  getUserPublicProfile 
} from './player';
import * as friendService from './friendService';

const fastify = Fastify({logger: true});

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

fastify.register(fastifyStatic, {
      	root: path.join(process.cwd(), 'uploads'),
      	prefix: '/static/'
});

// --- PROFILE INTERNAL MIDDLEWARE ---
async function requireServiceAuth(req: any, reply: any) {

      	const auth = req.headers.authorization;

      	if (!auth) {
	    	return reply.status(401).send({ error: 'Missing auth' });
      	}

      	const token = auth.replace('Bearer ', '');

      	if (token !== process.env.SERVICE_TOKEN) {
	    	return reply.status(403).send({ error: 'Forbidden' });
      	}
}

// --- PRIVATE PROFILE ---
fastify.get('/me', async (req, reply) => {
	try {
	      	const userId = req.headers['x-user-id'];

	      	if (!userId) {
		    	return reply.status(401).send({ error: 'Unauthorized' });
	      	}

		if (typeof userId !== 'string') {
			return reply.status(401).send({ error: 'Wrong type of header' });
		}
		
		let player = await getPlayerById(userId);

	  // create new player if it was authorized (signup), but no profile in database
		if (!player) {
      			player = await createPlayer(userId);
      		}

		return reply.send(player);
	} catch (err: any) {

		fastify.log.error(err);
		reply.status(500).send({ error: 'Internal server error' });
	  }
});

// --- CHANGE PROFILE ---
fastify.patch('/me', async (req, reply) => {
	try {
		const userId = req.headers['x-user-id'];

		if (!userId) {
		    	return reply.status(401).send({ error: 'Unauthorized' });
	      	}

		if (typeof userId !== 'string') {
			return reply.status(401).send({ error: 'Wrong type of header' });
		}

		const data = req.body as any;

		await updatePlayerInfo(userId, data);

		return reply.send({ status: 'Player info updated' });


	} catch (err: any) {

		if (err?.code === 'SQLITE_CONSTRAINT') {
			return reply.status(409).send({ error: 'Nickname already exists' });
	    	}

		fastify.log.error(err);
		reply.status(500).send({ error: 'Internal server error' });
	
	} 
});

// --- UPDATE USER STATS ---
fastify.post('internal/profile/stats', { preHandler: requireServiceAuth }, async (req: any, reply) => {
	const { userId, gameId, result, opponentRate }  = req.body;

	if (!userId || !gameId || !result || !opponentRate) {
		return reply.status(400).send({ errsr: 'incomplete request'});
	}

	try {
		await updatePlayerStats(userId, gameId, result, opponentRate);
		reply.send({ status: 'player_stats_updated'});
	} catch (err) {
		req.log.error(err);
		reply.status(500).send({ error: 'PROFILE_STATS_UPDATE_FAILED'});
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
fastify.post('/me/avatar', async (req, reply) => {
	try {
		const userId = req.headers['x-user-id'];

		if (!userId) {
			return reply.status(401).send({ error: 'Wrong type of header' });
		}

		if (typeof userId !== 'string') {
			return reply.status(401).send({ error: 'Wrong type of header' });
		}

		const file = await req.file();

	    	if (!file) {
		  	return reply.status(400).send({
				error: 'Avatar file is required'
		  	});
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

// --- PUBLIC PROFILE ---
fastify.get('/users/id', async (req, reply) => {

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
fastify.post('/friends/:toId', async (req, reply) => {
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
fastify.post('/friends/:requesterId/accept', async (req, reply) => {
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
fastify.post('/friends/:requesterId/reject', async (req, reply) => {
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
fastify.post('/friends/:requesterId/cancel', async (req, reply) => {
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
fastify.delete('/friends/:friendId', async (req, reply) => {
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
fastify.post('/friends/:targetId/block', async (req, reply) => {
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
fastify.post('/friends/:targetId/unblock', async (req, reply) => {
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
fastify.get('/friends', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	return friendService.getFriendsService(userId);
});

// --- GET INCOMING FRIEND REQUESTS ---
fastify.get('/friends/requests/incoming', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	return friendService.getIncomingRequestsService(userId);
});

// --- GET OUTGOING FRIEND REQUESTS ---
fastify.get('/friends/requests/outgoing', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	return friendService.getOutgoingRequestsService(userId);
});

// --- GET BLOCK LIST ---
fastify.get('/friends/blocked', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	return friendService.getBlocklistService(userId);
});

// --- GET FRIEND STATUS ---
fastify.get('/friends/:otherId/status', async (req, reply) => {
    	const userId = req.headers['x-user-id'] as string;
    	const { otherId } = req.params as { otherId: string };
    	return friendService.getFriendStatusService(userId, otherId);
});

// --- START SERVER ---
const start = async () => {
	try {
	      await initProfileDB();
	      console.log(chalk.green.bold('Database initialized'));
	      await fastify.listen({ port: 8082, host: '0.0.0.0' });
	      console.log(chalk.green.bold('Player service is running on :8082'));
	} catch(err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
