export type GameMode = 'ai-easy' | 'ai-medium' | 'ai-hard' | '2p-local' | '2p-online';

export type PvpAction = 'create' | 'join';

export interface GameSessionConfig {
  playerId: string;
  mode: GameMode;
  scoreToWin: number;
  player1Name: string;
  player2Name: string;
  player1Color: string;
  player2Color?: string;
  pvpRoomId?: string;
  pvpAction?: PvpAction;
}
