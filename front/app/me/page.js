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
    const { checkAuth } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const fetchMyProfile = async () => {
            try {
                const response = await fetch('/api/profile/me', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        },
                    });
                    const isAuthenticated = await checkAuth();
                    if (!isAuthenticated) 
                {
                    router.push('/login');
                    return;
                }
                
                const data = await response.json();
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
    }, [checkAuth, router]);
    return (
        <main>
            <NavigationAppUI  />
            { console.info("Translation", t) }
            <h1>{t?.profilePage?.title || "My Private Profile" }</h1>
        </main>
    );
}