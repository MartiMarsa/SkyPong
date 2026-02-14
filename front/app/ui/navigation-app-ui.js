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