'use client';


import { useState, useEffect } from 'react';
import { useStyles } from './hooks/use-styles';
import { useTranslation } from './hooks/use-translation';
import { setCurrentLocale, getCurrentLocale } from './lib/i18n/locale-manager';
import HeroUI from './ui/hero-ui';
import NavigationAppUI from './ui/navigation-app-ui';
import FooterTermsPolicy from './ui/footer-terms-policy';
import NavigationLanguageUI from './ui/navigation-language-ui';

const mobileStyles = {
    main: "h-screen",
}

const desktopStyles = {
    main: "",
}

export default function HomePage()
{
    const { styles } = useStyles(mobileStyles, desktopStyles);
    const { t } = useTranslation();
  return (
    <>
        <main className={ styles.main }>
            <NavigationAppUI userURL="/login" />
            <div className="main-content flex column justify-center align-center md:basis-3/4 lg:basis-1/2 flex flex-col">
                <HeroUI />
            <NavigationLanguageUI />
            </div>
            <FooterTermsPolicy />
        </main>
    </>
  );
}