import { Client } from 'colyseus.js';
import { SERVER_CONNECTION } from './server-config';

export interface RoomInfo {
  id: string;
  name: string;
  creatorName: string;
  players: number;
  status: string;
}

let clientInstance: Client | null = null;

function getClient(): Client {
  if (!clientInstance) {
    console.log('[RoomService] Creating new Colyseus client');
    clientInstance = new Client(SERVER_CONNECTION.WS_URL);
    console.log('[RoomService] Client created with URL:', SERVER_CONNECTION.WS_URL);
  }
  return clientInstance;
}

export async function getAvailableRooms(): Promise<RoomInfo[]> {
  try {
    const client = getClient();
    console.log('[RoomService] Connecting to:', SERVER_CONNECTION.WS_URL);
    console.log('[RoomService] Room type:', SERVER_CONNECTION.ROOMS.PVP_ROOM);
    
    const rooms = await client.getAvailableRooms(SERVER_CONNECTION.ROOMS.PVP_ROOM);
    
    console.log('[RoomService] Received rooms:', rooms);
    
    return rooms.map((room) => ({
      id: room.roomId,
      name: room.metadata?.roomName || `Room ${room.roomId.slice(0, 6)}`,
      creatorName: room.metadata?.player1Name || '',
      players: room.clients,
      status: room.metadata?.waitingForOpponent ? 'WAITING' : 'FULL',
    }));
  } catch (error) {
    console.error('[RoomService] Failed to get available rooms:', error);
    console.error('[RoomService] Error message:', error?.message);
    console.error('[RoomService] Error code:', error?.code);
    console.error('[RoomService] Server URL:', SERVER_CONNECTION.WS_URL);
    return [];
  }
}

export async function createRoom(options: {
  playerName: string;
  playerColor: string;
  winningScore?: number;
  playerId?: string;
  roomName?: string;
}): Promise<{ roomId: string }> {
  const client = getClient();
  
  console.log('[RoomService] Creating room with options:', options);
  console.log('[RoomService] Server URL:', SERVER_CONNECTION.WS_URL);
  
  try {
    const room = await client.create(SERVER_CONNECTION.ROOMS.PVP_ROOM, {
      playerName: options.playerName,
      playerColor: options.playerColor,
      winningScore: options.winningScore,
      playerId: options.playerId,
      roomName: options.roomName,
    });

    console.log('[RoomService] Room created:', room.roomId);
    return { roomId: room.roomId };
  } catch (error) {
    console.error('[RoomService] Failed to create room:', error);
    console.error('[RoomService] Error message:', error?.message);
    throw error;
  }
}

export async function joinRoom(roomId: string, options: {
  playerName: string;
  playerColor: string;
  winningScore?: number;
  playerId?: string;
}): Promise<void> {
  const client = getClient();
  
  await client.joinById(roomId, {
    playerName: options.playerName,
    playerColor: options.playerColor,
    winningScore: options.winningScore,
    playerId: options.playerId,
  });
}
