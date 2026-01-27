import { getCurrentLocale } from '../lib/i18n/locale-manager';
import  l from '../lib/i18n/localizer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { locales } from '../lib/i18n/localizer';
/*
Achievement object structure:
  {
    id: 2, 
    key: 'achivements.winAchievements.win10Games', 
    nameKey: 'achivements.winAchievements.win10Games', 
    descriptionKey: 'achivements.winAchievements.win10GamesDesc',
    logoURL: '/assets/achivements/win10Games.png',
    requirement: 10,
  },
*/

function activateAchievements(achievements, wins, loses)
{

}
export default function PlayerAchievementsPublicUI( { achievements })
{
    const locs = locales();
    return (
        <article className="player-achievements-public-ui">
            <h3>{ l('achievements.title')}</h3>
            {console.log(achievements)}
            <div className="achievments-wrapper">

            {
                achievements.map(element => {
                    console.log("Achievement:", element);
                    return( <div className='achievement'>
                        <h4 className='achievement-title'>{l(`${element.nameKey}`)}</h4>
                        <p className='achievement-description'>{l(`${element.descriptionKey}`)}</p>
                        <div className='achievement-icon'>
                            <img src={element.placeholderUrl} alt={l(`${element.descriptionKey}`)} />
                        </div>
                    </div>
                  );
                })
            }
            </div>
        </article>
    );
}