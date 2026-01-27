import  { useState } from 'react';
import  l from '../lib/i18n/localizer';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';

export default function UserMenuUI({ userURL })
{
    return (
            <Link href={ userURL } className="user-menu">
                <FontAwesomeIcon icon={faCircleUser} />
            </Link>
    );
}