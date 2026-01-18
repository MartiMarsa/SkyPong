'use client';

import  { useState } from 'react';
import  { l } from '../lib/i18n/localizer';
import NavigationAppUI from '../ui/navigation-app-ui';
import PlayerProfilePublicUI from '../ui/player-profile-public-ui';
import PlayerStatsPublicUI from '../ui/player-stats-public-ui';
import { getCurrentPlayer } from '../lib/players/get-current-player';

const player = getCurrentPlayer();

export default function ProfilePagePublic()
{
    return (
        <main>
            <NavigationAppUI  />
            <h1>{l('profilePage.title')}</h1>
            <PlayerProfilePublicUI nickname={player.info.nickname} winphrase={player.info.winphrase} avatarUrl={player.info.avatarUrl}   />
            <PlayerStatsPublicUI wins={player.stats.wins} loses={player.stats.losses}/>
        </main>
    );
}