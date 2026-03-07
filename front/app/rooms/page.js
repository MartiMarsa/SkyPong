'use client';

import  { useState } from 'react';
import  l from '../lib/i18n/localizer';
import NavigationAppUI from '../ui/navigation-app-ui';
import FooterTermsPolicy from '../ui/footer-terms-policy';


export default function RemoteRoomLobbyPage()
{
    return (
        <main className="h-dvh bg-page-bg flex flex-col">
            <NavigationAppUI />
            <div className="flex flex-1 items-center justify-center">
                <div className="page-content-container">
                    <div className="content-container-md">
                        <h1>{l('remoteRoomLobbyPage.title')}</h1>
                    </div>
                </div>
            </div>
            <div className="mt-auto pb-4">
                <FooterTermsPolicy />
            </div>
        </main>
    );
}