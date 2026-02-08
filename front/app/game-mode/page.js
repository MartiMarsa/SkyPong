'use client';

import { useTranslation } from '../hooks/use-translation';
import Link from 'next/link';
import { useStyles } from '../hooks/use-styles';
import { useEffect, useState } from 'react';
import NavigationAppUI from '../ui/navigation-app-ui';

const mobileStyles = { main: 'flex align-center', h1:'text-lg'}
const desktopStyles = { main: '', h1:'text-xl'}

export default function PlayPage()
{
    const { styles } = useStyles(mobileStyles, desktopStyles);
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