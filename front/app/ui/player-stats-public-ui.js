import  { l } from '../lib/i18n/localizer';

export default function PlayerStatsPublicUI( { wins, losses })
{
    return (
        <article className="player-stats-public-ui">
            <ul>
                <li><i class="fa-solid fa-flag-checkered"></i>{l('player.wins')}<span className="player-stats-value">{wins}</span></li>
                <li><i class="fa-solid fa-explosion"></i>{l('player.losses')}<span className="player-stats-value">{losses}</span></li>
                <li><i class="fa-solid fa-percent"></i>{l('player.winRate')}<span className="player-stats-value">{wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0}%</span></li>
            </ul>
        </article>
    );
}