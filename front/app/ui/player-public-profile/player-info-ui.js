import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/use-translation';
import { useAuth } from '../../context/auth-context';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStyles } from '../../hooks/use-styles';
import { useRouter } from 'next/navigation';
import AddFriendButton from './AddFriendButton';
import Loader from '../loader/loader-ui'

const mobileStyles = {
    title: "",
    playerIdentity: "flex-row",
    avatar:'rounded-full max-h-30 aspect-square border-3 border-orange-400',
    nickname: '',
    winPhrase: '',
};

const desktopStyles = {
    title: "",
    playerIdentity: "flex-row",
    avatar:'rounded-full max-h-30 aspect-square border-3 border-orange-400',
    nickname: '',
    winPhrase: '',
};

const getCookie = (name) => {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
};

export default function PlayerInfo({profile})
{
    const router = useRouter();
    const { user, authloading, checkAuth } = useAuth();
    const { t } = useTranslation();
    const { styles } = useStyles(mobileStyles, desktopStyles);
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const csrfToken = getCookie();
    return (
        <>
        { authloading ? (<Loader />) : (
            <section className={styles.playerIdentity}>
                <img className={styles.avatar} src={profile?.avatarUrl || '/avatar/default-avatar.webp'}/>
                <p className={styles.nickname}>{profile?.nickname || 'PongoDio'}</p>
                <p className={styles.winPhrase}>{profile?.winPhrase || 'Silence is golden, or Pongo Dio up to you'}</p>
               { user?.id !== profile?.id ? (<AddFriendButton 
                    currentUserId={user?.id}
                    targetId={profile?.id}
                    csrfToken={csrfToken}
                />) : ('') } { /* /ui/player-public-profile/AddDriendButton */}
            </section>
        )}
        </>
    );    
}