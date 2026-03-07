'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationAppUI from '../ui/navigation-app-ui';
import { useTranslation } from '../hooks/use-translation';
import { useAuth } from '../context/auth-context';
import Link from 'next/link';
import AvatarUpload from '../ui/player-private-profile/avatar-ui';
import PlayerUI from '../ui/player-private-profile/player-ui';
import PlayerCredentialsUI from '../ui/player-private-profile/player-credentials-ui';
import PlayerDeleteUI from '../ui/player-private-profile/player-delete-account-ui';
import FooterTermsPolicy from '../ui/footer-terms-policy';

const getCsrfToken = () => {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];
};

export default function ProfilePagePrivate()
{
const { t } = useTranslation();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const { user, authloading, checkAuth } = useAuth();
    const [player, setPlayer] = useState(null);
    const [serverError, setServerError ] = useState('');
    
    // const searchParams = useSearchParams()
    // const id = searchParams.get('id') // Obtiene "123"
  useEffect(() => {
    // 1. Si el AuthContext aún está verificando la cookie, esperamos.
    if (authloading) return;

    // 2. Si ya terminó de cargar y NO hay usuario, mandamos a home.
    if (!user) {
        router.push('/');
        return;
    }

    const fetchMyProfile = async () => {
        // Iniciamos carga local para el perfil
        setIsLoading(true); 
        setServerError('');

        try {
            
             const csrfToken = getCsrfToken();
            console.log("Solicitando perfil para ID:", user.id);
            
            const response = await fetch(`/api/profile/me`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'x-csrf-token': csrfToken || '',
                },
            });

            console.info("Response: ", response);
            if (!response.ok) {
                if (response.status === 404)
                    setServerError(t.serverError.notFound);
                else 
                    setServerError(t.serverError.unknownError);
                return;
            }

            const data = await response.json();
            console.log("Datos recibidos:", data);
            
            // Seteamos el player con los datos de la API
            setPlayer(data); 

        } catch (error)
        {
            console.error('Error en fetchMyProfile:', error);
            setServerError("Error de conexión");
        } finally
        {
            // Solo dejamos de cargar cuando la petición termina (éxito o error)
            setIsLoading(false);
        }
    };

    // 3. Solo disparamos el fetch si tenemos el ID del usuario
    if (user?.id) {
        fetchMyProfile();
    }
    else
    {
        setIsLoading(false);
    }

}, [authloading, user, router]); 

    if (isLoading) return (
        <main className="h-dvh bg-page-bg flex flex-col items-center justify-center">
            <p className="text-muted">{t?.common?.loading || "Loading..."}</p>
        </main>
    );

    return (
        <>
        { serverError ? (
            <main className="h-dvh bg-page-bg flex flex-col items-center justify-center">
                <p className="error-message">{serverError}</p>
            </main>
        ) : (
        <main className="min-h-dvh bg-page-bg flex flex-col">
            <NavigationAppUI  />
            <div className="flex flex-1 items-start justify-center py-8">
                <div className="page-content-container-scrollable">
                    <div className="content-container-md">
                        <h1>{t?.profilePage?.title}</h1>
                        {console.info("Player in component: ", player)}
                        <AvatarUpload />
                        <PlayerUI />
                        <PlayerCredentialsUI />
                        <div className="flex-row justify-center">
                            <Link href="/me" className="link-primary">
                                {t?.profilePage?.viewProfile || "View My Profile"}
                            </Link>
                        </div>
                        <PlayerDeleteUI />
                    </div>
                </div>
            </div>
            <div className="pb-4">
                <FooterTermsPolicy />
            </div>
        </main>
        )}
        </>
    );
}