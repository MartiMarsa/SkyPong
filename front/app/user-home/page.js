'use client';


import { useState, useEffect } from 'react';
import SelectStyles from '../js/detectMobile';
import { useTranslation } from '../hooks/use-translation';
import HeroUI from '../ui/hero-ui';
import NavigationAppUI from '../ui/navigation-sign-ui';
import FooterTermsPolicy from '../ui/footer-terms-policy';

export default function UserHomePage()
{
    const [styles, setStyles ] = useState(mobileStyles);
    useEffect(() => {
        // Esto solo corre en el cliente, después del montaje
        setStyles(SelectStyles(mobileStyles, desktopStyles));
    }, []);
    const { t } = useTranslation();
  return (
    <>
        <main className='flex justify-center items-stretch min-h-screen align-stretch bg-gradient-to-b from-blue-100 to-blue-300'>
            <NavigationAppUI home="/user-home" userURL="/you" />
            <div className="main-content flex column justify-center align-center md:basis-3/4 lg:basis-1/2 flex flex-col">
                <HeroUI />
            </div>
            <FooterTermsPolicy />
        </main>
    </>
  );
}