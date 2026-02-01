'use client';
import  { useState, useEffect } from 'react';
import { useTranslation } from '../context/language-context';
import Link from 'next/link';
import { useStyles } from '../hooks/use-styles';

const mobileStyles = { nav: 'flex justify-between p-2 text-3xl', langlink: '' }
const desktopStyles = { nav: '', langlink: '' }

export default function NavigationLanguageUI({ })
{
    const { styles } = useStyles(mobileStyles, desktopStyles);
    const { t, changeLanguage } = useTranslation();

    return (
        <nav className={styles.nav}>
                <Link 
                    key='es' 
                    onClick={() => changeLanguage('es')} 
                    className={styles.langlink}
                    href="#">
                    es
                </Link>
                <Link 
                    key='en' 
                    onClick={() => changeLanguage('en')} 
                    className={styles.langlink}
                    href="#">
                    en
                </Link>
                <Link 
                    key='it' 
                    onClick={() => changeLanguage('it')} 
                    className={styles.langlink}
                    href="#">
                    it
                </Link>

        </nav>
    );
}