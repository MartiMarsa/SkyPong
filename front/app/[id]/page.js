'use client';

import  { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/use-translation';
import NavigationAppUI from '../ui/navigation-app-ui';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import PlayerInfo from '../ui/player-public-profile/player-info-ui';
import PlayerAchievementsUI from '../ui/player-public-profile/player-achievements-ui';
import AchievementsSection from '../ui/player-public-profile/AchievementsSection';
import { useParams } from 'next/navigation'
import FriendsList from '../ui/player-public-profile/friend-list.ui';
import GameHistory from '../ui/player-public-profile/GameHistory';

export default function ProfilePagePublic()
{
    const { id } = useParams();  
    const t = useTranslation();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const { user, authloading} = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [serverError, setServerError] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const getCookie = (name) => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith(name + '='))
            ?.split('=')[1];
    };
    
    console.info("Friend id:", id);
    useEffect(() => {
        console.info("User session: ", user);
        if (authloading) return;
        
        // 2. Si ya terminó de cargar y NO hay usuario, mandamos a home.
        if (!user) {
            router.push('/');
            return;
        }

        const csrfToken = getCookie();
    
        fetch(`/api/profile/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken || '',
            },
            credentials: 'include',
        })
        .then(res => res.json())
        .then(data => setProfile(data.user))
        .catch((err) => {
            console.error("Error:", err)
            setServerError(err);
        }).finally(setCsrfToken(csrfToken));
    }, [id, authloading]);
    return (
        <main>
            { console.info("Public profile data:", profile) }
            <NavigationAppUI  />
            <h1>{t.t?.homePage?.title || "Public Profilactic" }</h1>
            {profile && <PlayerInfo profile={profile} />}
            { profile && <GameHistory userId={profile.id} />}
            {profile && <FriendsList currentUserId={user?.id} targetId={profile?.id} csrfToken={csrfToken}/>}
            { profile && <AchievementsSection t={t.t} stats={profile?.stats} /> }
        </main>
    );
}

