'use client';

import  { useState } from 'react';
import NavigationAppUI from '../ui/navigation-app-ui';
import PlayerProfilePublicUI from '../ui/player-profile-public-ui';
import PlayerStatsPublicUI from '../ui/player-stats-public-ui';
import PlayerAchievementsPublicUI from '../ui/player-achievements-public-ui';
import { getCurrentPlayer } from '../lib/players/get-current-player';
import { useTranslation } from '../hooks/use-translation';

const player = getCurrentPlayer();

export default function ProfilePagePublic()
{
    const t = useTranslation();
    return (
        <main>
            <NavigationAppUI  />
            {console.log("T", t)}
            <h1>{t.profilePage}</h1>
            <PlayerProfilePublicUI nickname={player.info.nickname} winphrase={player.info.winphrase} avatarUrl={player.info.avatarUrl}   />
            <PlayerStatsPublicUI wins={player.stats.wins} losses={player.stats.losses}/>
            <PlayerAchievementsPublicUI achievements={player.achievements} />    
        </main>
    );
}