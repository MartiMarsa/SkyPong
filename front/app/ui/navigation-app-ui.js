import  { useState, useEffect } from 'react';
import  l from '../lib/i18n/localizer';
import Link from 'next/link';
import HomeButtonUi from './home-button-ui.js'
import SelectStyles from '../js/detectMobile.js';


const mobileStyles = { nav: '' }
const desktopStyles = { nav: '' }

function getHomeURL()
{
    //Create Logic
    return "/user-home"
}

export default function NavigationAppUI()
{
    const [styles, setStyles ] = useState(mobileStyles);
    useEffect(() => {
        // Esto solo corre en el cliente, después del montaje
        setStyles(SelectStyles(mobileStyles, desktopStyles));
    }, []);
    return (
        <nav className= { mobileStyles.nav }>
            <HomeButtonUi url={ getHomeURL() } />
        </nav>
    );
}