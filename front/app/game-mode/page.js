'use client';

import { useTranslation } from '../hooks/use-translation';
import Link from 'next/link';
import SelectStyles from '../js/detectMobile';
import { useEffect, useState } from 'react';
import NavigationAppUI from '../ui/navigation-app-ui';

const mobileStyles = { main: 'flex align-center', h1:'text-lg'}
const desktopStyles = { main: '', h1:'text-xl'}

export default function PlayPage()
{
    const [styles, setStyles ] = useState(mobileStyles);
    useEffect(() => {
        // Esto solo corre en el cliente, después del montaje
        setStyles(SelectStyles(mobileStyles, desktopStyles));
    }, []);
    const { t } = useTranslation();
  return (
    <>
        <main className={ styles.main }>
            <NavigationAppUI home="/" />
            <h1 className={ styles.h1 }>{t.gameMode.title}</h1>
        </main>
    </>
  );
}