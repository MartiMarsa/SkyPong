'use client';

import SelectStyles from '../js/detectMobile'; 
import { useEffect, useState } from 'react';
import l  from '../lib/i18n/localizer';
import Link from 'next/link';


const mobileStyles = {
    main: "",
    h1: "text-lg",
}

const desktopStyles = {
    main: "",
    h1: "text-xl",
}



export default function UserPlayPage()
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
            <h1 className={ styles.h1 }>{ l('homePage.title') }</h1>
        </main>
    </>
  );
}