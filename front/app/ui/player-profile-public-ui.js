import l from '../lib/i18n/localizer';

export default function PlayerProfilePublicUI({ nickname, winphrase, avatarUrl, bio })
{
    return (
        <article className="player-profile-public-ui">
            <div className='player-avatar'>
                <img src={avatarUrl} alt={l('playerProfilePublicUI.avatarAltText')} />
            </div>
            <div className='player-info'>
                <h2 className='player-nickname'>{ nickname}</h2>
                <h3 className='player-winphrase'> { winphrase }</h3>
                <p className='player-bio'>{bio}</p>
            </div>
        </article>
    );
}