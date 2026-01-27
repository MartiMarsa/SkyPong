'use client';

import SelectStyles from '../js/detectMobile'; 
import l  from '../lib/i18n/localizer';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
  return (
    <>
        <main className={ styles.main }>
            {/* GAME CANVA */}
            <h1 className={ styles.h1 }>Game Canva (this, to be removed)</h1>
        </main>
    </>
  );
}