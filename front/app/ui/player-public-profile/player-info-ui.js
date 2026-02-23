import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/use-translation';
import { useAuth } from '../../context/auth-context';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStyles } from '../../hooks/use-styles';
import { useRouter } from 'next/navigation';
import { title } from 'process';

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

export default function PlayerInfo({avatarURL, nickname, winPhrase})
{
    const router = useRouter();
    const { user, authloading, checkAuth } = useAuth();
    const { t } = useTranslation();
    const { styles } = useStyles(mobileStyles, desktopStyles);
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [player, setPlayer] = useState('');
    return (
        <>
            <section className={styles.playerIdentity}>
                <img className={styles.avatar} src={avatarURL}/>
                <p className={styles.nickname}>{nickname}</p>
            </section>
            <section className={styles.winPhrase}>
                <p className={styles.winPhrase}>{winPhrase}</p>
            </section>
        </>
    );    
}