import  { useState } from 'react';
import  l from '../lib/i18n/localizer';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';

export default function HomeButtonUI({ url })
{
    return (
        <Link href={ url } className="home-button">
            <label className="nav-menu-item-lable hidden">{l('homePage.lable')}</label>
            <FontAwesomeIcon icon={ faHouse } />
        </Link>
    );
}