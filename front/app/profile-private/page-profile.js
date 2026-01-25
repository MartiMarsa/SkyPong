'use client';

import  { useState } from 'react';
import  l from '../lib/i18n/localizer';
import NavigationAppUI from '../ui/navigation-app-ui';

export default function ProfilePage()
{
    return (
        <main>
            <NavigationAppUI  />
            <h1>{l('profilePage.title')}</h1>
        </main>
    );
}