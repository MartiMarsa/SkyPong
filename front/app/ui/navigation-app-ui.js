import  { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/use-translation';
import Link from 'next/link';
import HomeButtonUi from './home-button-ui.js'
import { useStyles } from '../hooks/use-styles';
import UserMenuUI from './user-menu-ui.js';
import { useRouter } from 'next/navigation';


const mobileStyles = { nav: 'flex justify-between p-2 text-3xl' }
const desktopStyles = { nav: '' }


export default function NavigationAppUI({ home, userURL })
{
    const router = useRouter();
    useEffect(() => {
        const logout = async () => {
            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    // Redirige a la página de inicio o de login después del logout
                    router.push('/');
                    
                } else {
                    console.error('Error al cerrar sesión');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }, []); 
    const { t } = useTranslation();
    const { styles } = useStyles(mobileStyles, desktopStyles);
    return (
        <nav className= { styles.nav }>
            { !home && <Link href="/api/auth/logout" className=''>{t.navigation.logout}</Link> }
            { home && <HomeButtonUi url={ home } /> }
            { userURL && <UserMenuUI userURL={ userURL } />}
        </nav>
    );
}