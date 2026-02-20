'use client';

import  { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/use-translation';
import NavigationAppUI from '../ui/navigation-app-ui';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';

export default function ProfilePagePublic()
{
    const t = useTranslation();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const { userInfo, checkAuth, hasCredentials} = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const fetchMyProfile = async () => {
            try {
                const isAuthenticated = await checkAuth();
                if (!isAuthenticated)
                {
                    router.push('/login');
                    return;
                }

                const response = await fetch('/api/profile/me', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        },
                    });
                await checkAuth();
                if (!hasCredentials) 
                {
                    throw new Error(`Profile request failed with status ${response.status}`);
                }

                const rawBody = await response.text();
                if (!rawBody)
                {
                    throw new Error('Profile request returned an empty response body');
                }

                let data;
                try {
                    data = JSON.parse(rawBody);
                } catch {
                    throw new Error('Profile request did not return valid JSON');
                }

                console.info("Data:", data);
                setProfile(data.player);
            } catch (error) {
                console.error('Error:', error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyProfile();
    }, [router]);
    return (
        <main>
            <NavigationAppUI  />
            { console.info("Translation", t) }
            <h1>{t?.profilePage?.title || "My Private Profile" }</h1>
        </main>
    );
}
