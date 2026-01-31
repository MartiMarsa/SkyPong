import  l from '../lib/i18n/localizer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlagCheckered } from '@fortawesome/free-solid-svg-icons/faFlagCheckered';
import { faExplosion } from '@fortawesome/free-solid-svg-icons/faExplosion';
import { faPercent } from '@fortawesome/free-solid-svg-icons/faPercent';

export default function PlayerStatsPublicUI( { wins, losses })
{
    return (
        <article className="player-stats-public-ui">
            <ul>
                <li><FontAwesomeIcon icon={faFlagCheckered} />{l('player.wins')}<span className="player-stats-value"> {wins}</span></li>
                <li><FontAwesomeIcon icon={faExplosion} />{l('player.losses')}<span className="player-stats-value"> {losses}</span></li>
                <li><FontAwesomeIcon icon={faPercent} />{l('player.winRate')}<span className="player-stats-value"> {wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0}%</span></li>
            </ul>
        </article>
    );
}