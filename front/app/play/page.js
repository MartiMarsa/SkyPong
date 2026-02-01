'use client';

import SelectStyles from '../lib/mobiledetection/detectMobile';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '../hooks/use-translation';
import { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/use-translation';

const mobileStyles = {
    main: "",
    h1: "text-lg",
}

const desktopStyles = {
    main: "",
    h1: "text-xl",
}


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
            {/* GAME CANVA */}
            <h1 className= { styles.h1 }>{t.playPage.title}</h1>
        </main>
    </>
  );
}