'use client';

import  { useState } from 'react';
import  { useTranslation } from '../hooks/use-translation';
import Leaderboard from '../ui/Leaderboard';
import NavigationAppUI from '../ui/navigation-app-ui';
import FooterTermsPolicy from '../ui/footer-terms-policy';


export default function LeaderboardPage()
{
    const { t } = useTranslation();
    return (
        <>
            <main className="min-h-dvh bg-page-bg flex flex-col">
                <NavigationAppUI />
                <div className="flex flex-1 items-start justify-center page-wrapper-with-nav">
                    <div className="page-content-container-scrollable">
                        <div className="content-container-xl">
                            <h1>{t?.leaderboardPage?.title || 'Leaderboard'}</h1>
                            <Leaderboard />
                        </div>
                    </div>
                </div>
                <div className="pb-4">
                    <FooterTermsPolicy />
                </div>
            </main>
        </>
    );
}