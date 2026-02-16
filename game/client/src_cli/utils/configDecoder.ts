// /game/client/src_cli/utils/configDecoder.ts
// Base64 encoding/decoding and validation for GameSessionConfig

import {
  GameSessionConfig,
  DecodeResult,
  VALID_GAME_MODES,
  GameMode,
} from '../types/GameSessionConfig';

/**
 * Encodes a GameSessionConfig object to base64 string
 * Use this in the frontend (Next.js) before navigating to /launch
 */
export function encodeConfig(config: GameSessionConfig): string {
  try {
    const jsonString = JSON.stringify(config);
    return btoa(jsonString);
  } catch (error) {
    throw new Error('Failed to encode configuration: ' + (error as Error).message);
  }
}

/**
 * Decodes and validates a base64-encoded configuration string
 * Returns either a valid config or an error object
 */
export function decodeConfig(base64String: string | null): DecodeResult {
  // Check if config parameter exists
  if (!base64String) {
    return {
      valid: false,
      error: 'No configuration provided in URL',
    };
  }

  // Decode base64
  let jsonString: string;
  try {
    jsonString = atob(base64String);
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to decode configuration. Invalid base64 format.',
    };
  }

  // Parse JSON
  let config: Partial<GameSessionConfig>;
  try {
    config = JSON.parse(jsonString);
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to parse configuration. Invalid JSON format.',
    };
  }

  // Validate required fields
  const missingFields: string[] = [];

  // TODO: Add playerId validation when auth is integrated
  // if (!config.playerId) missingFields.push('playerId');

  if (!config.playerName) missingFields.push('playerName');
  if (!config.playerColor) missingFields.push('playerColor');
  if (!config.gameMode) missingFields.push('gameMode');

  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields,
    };
  }

  // Validate gameMode is valid
  const gameMode = config.gameMode as GameMode;
  if (!VALID_GAME_MODES.includes(gameMode)) {
    return {
      valid: false,
      error: `Invalid gameMode: '${config.gameMode}'. Must be one of: ${VALID_GAME_MODES.join(', ')}`,
    };
  }

  // Validate mode-specific required fields
  if (gameMode === 'local-2p' && !config.player2Name) {
    return {
      valid: false,
      error: 'player2Name is required for local-2p mode',
      missingFields: ['player2Name'],
    };
  }

  if (gameMode === 'online-join' && !config.roomId) {
    return {
      valid: false,
      error: 'roomId is required for online-join mode',
      missingFields: ['roomId'],
    };
  }

  // All validations passed
  return {
    valid: true,
    config: config as GameSessionConfig,
  };
}

/**
 * Transforms unified GameSessionConfig to legacy format for CanvasPage
 * This maintains backward compatibility with existing Game.ts
 */
export function transformToLegacyState(config: GameSessionConfig): {
  mode: string;
  player1Name: string;
  player2Name: string;
  player1Color: string;
  player2Color: string;
  pvpRoomId?: string;
  pvpAction?: 'create' | 'join';
} {
  const baseState = {
    player1Name: config.playerName,
    player1Color: config.playerColor,
    player2Color: config.player2Color || '#F6511D',
  };

  switch (config.gameMode) {
    case 'local-2p':
      return {
        ...baseState,
        mode: '2p-local',
        player2Name: config.player2Name || 'Player 2',
      };

    case 'online-create':
      return {
        ...baseState,
        mode: '2p-online',
        player2Name: '',
        pvpAction: 'create' as const,
      };

    case 'online-join':
      return {
        ...baseState,
        mode: '2p-online',
        player2Name: '',
        pvpRoomId: config.roomId,
        pvpAction: 'join' as const,
      };

    case 'ai-easy':
    case 'ai-medium':
    case 'ai-hard':
      return {
        ...baseState,
        mode: config.gameMode,
        player2Name: 'AI',
      };

    default:
      // Fallback to local 2p (should never reach here due to validation)
      return {
        ...baseState,
        mode: '2p-local',
        player2Name: config.player2Name || 'Player 2',
      };
  }
}
