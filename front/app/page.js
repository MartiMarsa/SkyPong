'use client';


import { useState, useEffect } from 'react';
import SelectStyles from './js/detectMobile';
import l from './lib/i18n/localizer';
import HeroUI from './ui/hero-ui';
import NavigationAppUI from './ui/navigation-app-ui';
import FooterTermsPolicy from './ui/footer-terms-policy';

const mobileStyles = {
    main: "h-screen",
}

const desktopStyles = {
    main: "",
}

export default function HomePage()
{
    const [styles, setStyles ] = useState(mobileStyles);
    useEffect(() => {
        // Esto solo corre en el cliente, después del montaje
        setStyles(SelectStyles(mobileStyles, desktopStyles));
    }, []);

  return (
    <>
        <main className={ styles.main }>
            <NavigationAppUI userURL="/signin" />
            <div className="main-content flex column justify-center align-center md:basis-3/4 lg:basis-1/2 flex flex-col">
                <HeroUI title={l('homePage.title')} subtitle={l('homePage.description')} />
            </div>
            <FooterTermsPolicy />
        </main>
    </>
  );
}