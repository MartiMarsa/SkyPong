'use client';

import  { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/use-translation';
import NavigationAppUI from '../ui/navigation-app-ui';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import PlayerInfo from '../ui/player-public-profile/player-info-ui';
import PlayerAchievementsUI from '../ui/player-public-profile/player-achievements-ui';
import AchievementsSection from '../ui/player-public-profile/AchievementsSection';
import FriendsSection from '../ui/player-public-profile/FriendsSection';

export default function ProfilePagePublic()
{
    const { id } = params;  
    const t = useTranslation();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const { user, authloading} = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [serverError, setServerError] = useState('');
    const getCookie = (name) => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith(name + '='))
            ?.split('=')[1];
    };
    
    console.info("Friend id:", id , " is not ", user.id);
    useEffect(() => {
        console.info("User session: ", user);
        if (authloading) return;
        
        // 2. Si ya terminó de cargar y NO hay usuario, mandamos a home.
        if (!user) {
            router.push('/');
            return;
        }

        fetch(`/api/profile/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({...data, avatarURL: 'default-avatar.webp'}),
        })
        .then(res => res.json())
        .then(data => setProfile(data.user))
        .catch((err) => {
            console.error("Error:", err)
            setServerError(err);
        });
    }, [id, profile, authloading]);
    return (
        <main>
            <NavigationAppUI  />
            <h1>{t.t?.homePage?.title || "Public Profilactic" }</h1>
            {profile && <PlayerInfo avatarURL={profile?.avatarUrl || "/avatar/default-avatar.png"} nickname={profile?.nickname || "Pongo Dio"} winPhrase={profile?.winPhrase || "I'm a bad ass win phrase"} />}
            { profile && <FriendsSection
                currentUserId={user.id}
                csrfToken={getCookie()}
                onNavigateProfile={(id) => router.push(`/api/profile/me/${id}`)}
                />}
            { profile && <AchievementsSection t={t.t} stats={profile?.stats} /> }
        </main>
    );
}

