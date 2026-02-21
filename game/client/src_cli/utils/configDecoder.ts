import { GameSessionConfig } from '../types/GameSessionConfig';

export function encodeConfig(config: GameSessionConfig): string {
  const json = JSON.stringify(config);
  const utf8 = encodeURIComponent(json);
  return btoa(utf8);
}

export function decodeConfig(encoded: string): GameSessionConfig {
  const utf8 = atob(encoded);
  const json = decodeURIComponent(utf8);
  return JSON.parse(json) as GameSessionConfig;
}

export function isValidConfig(config: Partial<GameSessionConfig> | null | undefined): config is GameSessionConfig {
  if (!config) {
    return false;
  }

  if (!config.playerId || !config.mode || !config.player1Name || !config.player2Name || !config.player1Color) {
    return false;
  }

  if (typeof config.scoreToWin !== 'number' || Number.isNaN(config.scoreToWin) || config.scoreToWin < 1) {
    return false;
  }

  return true;
}
