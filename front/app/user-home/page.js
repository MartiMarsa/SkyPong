'use client';


import { useState, useEffect } from 'react';
import SelectStyles from '../js/detectMobile';
import l from '../lib/i18n/localizer';
import HeroUI from '../ui/hero-ui';
import NavigationAppUI from '../ui/navigation-sign-ui';
import FooterTermsPolicy from '../ui/footer-terms-policy';
import ModalModeSelector from '../ui/modal-mode-selector';

export default function UserHomePage()
{
    const [styles, setStyles ] = useState(mobileStyles);
    useEffect(() => {
        // Esto solo corre en el cliente, después del montaje
        setStyles(SelectStyles(mobileStyles, desktopStyles));
    }, []);
  return (
    <>
        <main className='flex justify-center items-stretch min-h-screen align-stretch bg-gradient-to-b from-blue-100 to-blue-300'>
            <NavigationAppUI home="/user-home" userURL="/you" />
            <div className="main-content flex column justify-center align-center md:basis-3/4 lg:basis-1/2 flex flex-col">
                <HeroUI title={l('homePage.title')} subtitle={l('homePage.description')} isModalOpen={isModalOpen} />
            </div>
            <FooterTermsPolicy />
        </main>
    </>
  );
}