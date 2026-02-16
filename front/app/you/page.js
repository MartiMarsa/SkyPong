'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationAppUI from '../ui/navigation-app-ui';
import PlayerProfilePublicUI from '../ui/player-profile-public-ui';
import PlayerStatsPublicUI from '../ui/player-stats-public-ui';
import PlayerAchievementsPublicUI from '../ui/player-achievements-public-ui';
import { useTranslation } from '../hooks/use-translation';
import { useAuth } from '../context/auth-context';


export default function ProfilePagePublic()
{
    const t = useTranslation();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const {user, checkAuth, hasCredentials } = useAuth();
    const [player, setPlayer] = useState(null);
    const [serverError, setServerError ] = useState(''); 
    
    useEffect(() => {
        const hasCredentials = async () => { await checkAuth() };
        setServerError('');
        if(!hasCredentials())
        {
            router.push('/');
            return;
        }

        const fetchMyProfile = async () => {
            try {
                console.log("You user: ", user);
                const response = await fetch(`/api/profile/users/${user?.id || '' }`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        },
                    });
                const data = await response.json();
                if (response.status === 404)
                {
                    setServerError("Ruta no encontrada");
                }
                setPlayer(data.user);
            } catch (error) {
                console.error('Error:', error);
                setServerError(`An error has ocurred: ${error}`);
                // router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyProfile();
    }, [router]);

    if (isLoading) return <div>Cargando tu perfil...</div>;

    return (
        <>
        { serverError ? (serverError) : (
        <main>
            <NavigationAppUI  />
            <h1>{t.profilePage}</h1>
            <PlayerProfilePublicUI nickname={ player?.nickname } winphrase={ player?.winphrase } avatarUrl={player?.avatarUrl }   />
            <PlayerStatsPublicUI wins={ player?.stats?.wins } losses={ player?.stats?.losses }/>
            {/* <PlayerAchievementsPublicUI achievements={ player?.achievements || player.achievements} />     */}
        </main>
        )}
        </>
    );
}
