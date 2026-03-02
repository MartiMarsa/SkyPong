'use client';

import  { useState } from 'react';
import  { useTranslation } from '../hooks/use-translation'
import Leaderboard from '../ui/Leaderboard'


export default function LeaderboardPage()
{
    const { t } = useTranslation();
    return (
        <>
            <main>
                <h1>{t?.leaderboardPage?.title || 'Leaderboard'}</h1>
                <Leaderboard />
            </main>
        </>
    );
}