'use client';

import SelectStyles from '../lib/mobiledetection/detectMobile'; 
import { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/use-translation';
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
    const { t } = useTranslation();
    const [styles, setStyles ] = useState(mobileStyles);
    useEffect(() => {
        // Esto solo corre en el cliente, después del montaje
        setStyles(SelectStyles(mobileStyles, desktopStyles));
    }, []);
  return (
    <>
        <main className={ styles.main }>
            {/* GAME CANVA */}
            <h1 className={ styles.h1 }>{ t.userPlayPage.title }</h1>
        </main>
    </>
  );
}