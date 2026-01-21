'use client';

import  { useState } from 'react';
import  l from '../lib/i18n/localizer';


export default function LeaderboardPage()
{
    return (
        <main>
            <h1>{l('leaderboardPage.title')}</h1>
        </main>
    );
}