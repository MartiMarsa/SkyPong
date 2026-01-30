import  { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/use-translation';
import Link from 'next/link';
import HomeButtonUi from './home-button-ui.js'
import SelectStyles from '../js/detectMobile.js';
import UserMenuUI from './user-menu-ui.js';


const mobileStyles = { nav: 'flex justify-between p-2 text-3xl' }
const desktopStyles = { nav: '' }

export default function NavigationAppUI({ home, userURL })
{
    const [styles, setStyles ] = useState(mobileStyles);
    useEffect(() => {
        // Esto solo corre en el cliente, después del montaje
        setStyles(SelectStyles(mobileStyles, desktopStyles));
    }, []);
    const { t } = useTranslation();
    return (
        <nav className= { styles.nav }>
            { !home && <Link href="/logout" className=''>{t.navigation.logout}</Link> }
            { home && <HomeButtonUi url={ home } /> }
            { userURL && <UserMenuUI userURL={ userURL } />}
        </nav>
    );
}