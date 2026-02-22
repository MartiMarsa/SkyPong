'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationAppUI from '../ui/navigation-app-ui';
import { useTranslation } from '../hooks/use-translation';
import { useAuth } from '../context/auth-context';
import { useStyles } from '../hooks/use-styles';
import Link from 'next/link';
import AvatarUpload from '../ui/player-private-profile/avatar-ui'
import PlayerUI from '../ui/player-private-profile/player-ui';
import PlayerCredentialsUI from '../ui/player-private-profile/player-credentials-ui';
import PlayerDeleteUI from '../ui/player-private-profile/player-delete-account-ui';

// import { useSearchParams } from 'next/navigation'
const mobileStyles = {
    goMyProfileWrapper: "flex-row justify-center",
    goMyProfileBtn: "p-4 gb-blue-400"
};

const desktopStyles = {
    goMyProfileWrapper: "flex-row center",
    goMyProfileBtn: "p-4 bg-blue-400 rounded-sm text-blue-900"
};

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
    const { styles } = useStyles(mobileStyles, desktopStyles);
    
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

    if (isLoading) return <div>Cargando tu perfil...</div>;

    return (
        <>
        { serverError ? (serverError) : (
        <main className=''>
            <NavigationAppUI  />
            <h1>{t?.profilePage?.title}</h1>
            {console.info("Player in component: ", player)}
            <AvatarUpload />
            <PlayerUI />
            <PlayerCredentialsUI />
            <div className={styles.goProfileWrapper}>
                <Link href="/me" className={styles.goMyProfileBtn}>Go my Profile</Link>
            </div>
            <PlayerDeleteUI />

        </main>
        )}
        </>
    );
}