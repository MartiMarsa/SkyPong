import { players } from './players';
import { currentPlayerId } from './current-player';


export function getCurrentPlayer() 
{
    const currentPlayer = players.find(player => player.id === currentPlayerId);
    return currentPlayer;
}