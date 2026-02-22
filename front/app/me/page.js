'use client';

import  { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/use-translation';
import NavigationAppUI from '../ui/navigation-app-ui';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import PlayerInfo from '../ui/player-public-profile/player-info-ui';

export default function ProfilePagePublic()
{
    const t = useTranslation();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const { user, checkAuth, hasCredentials} = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    const getCookie = (name) => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith(name + '='))
            ?.split('=')[1];
    };

    useEffect(() => {
        setIsLoading(true);
        const fetchMyProfile = async () => {
            try {
                const rawCookie = getCookie('csrf_token');
                const csrfToken = rawCookie ? decodeURIComponent(rawCookie) : '';

                if (!csrfToken) {
                    setServerError('CSRF token missing');
                    return;
                }
                console.log("Fetching profile...");
                const userid = user?.user_id; //We need to get the id of the user page
                const response = await fetch(`/api/profile/me/`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-csrf-token': csrfToken,
                        },
                    });
                
                const data = await response.json();
                console.info("Profile:", data);
                setProfile(data.player);
            } catch (error) {
                console.error('Error:', error);
                //router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyProfile();
    }, [profile, router]);
    return (
        <main>
            <NavigationAppUI  />
            { console.info("Translation", t) }
            <h1>{t?.homePage?.title || "Public Profilactic" }</h1>
            <PlayerInfo avatarURL={profile?.avatarURL || "/avatar/default-avatar.png"} nickName={profile?.nickName || "Pongo Dio"} winPhrase={profile?.winPhrase || "I'm a bad ass win phrase"} />
        </main>
    );
}

