'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationAppUI from '../ui/navigation-app-ui';
import PlayerProfilePublicUI from '../ui/player-profile-public-ui';
import PlayerStatsPublicUI from '../ui/player-stats-public-ui';
import PlayerAchievementsPublicUI from '../ui/player-achievements-public-ui';
import { getCurrentPlayer } from '../lib/players/get-current-player';
import { useTranslation } from '../hooks/use-translation';

const player = getCurrentPlayer();

export default function ProfilePagePublic()
{
    const t = useTranslation();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const response = await fetch('/api/auth/verify', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        },
                    });
                    if (response.ok)
                        return;
               if (response.status === 401) 
                {
                    // No autenticado → redirigir a login 
                    router.push('/login');
                    return;
                }
                
                const data = await response.json();
                setUser(data.user);
            } catch (error) {
                console.error('Error:', error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyProfile();
    }, [router]);

    if (isLoading) return <div>Cargando tu perfil...</div>;

    return (
        <main>
            <NavigationAppUI  />
            {console.log("T", t)}
            <h1>{t.profilePage}</h1>
            <PlayerProfilePublicUI nickname={ user?.nickname || player.info.nickname} winphrase={ user?.winphrase || player.info.winphrase} avatarUrl={user?.avatarUrl || player.info.avatarUrl}   />
            <PlayerStatsPublicUI wins={ user?.stats?.wins || player.stats.wins} losses={ user?.stats?.losses || player.stats.losses}/>
            <PlayerAchievementsPublicUI achievements={ user?.achievements || player.achievements} />    
        </main>
    );
}
