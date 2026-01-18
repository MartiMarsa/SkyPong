import  { useState } from 'react';
import  { l } from './lib/i18n/localizer';

export default function NavigationAppUI()
{
    return (
        <nav className="navigation-app-ui">
            <div className="nav-logo">{l('homePage.title')}</div>
            <ul className="nav-links">
                <li><a href="/home">{l('navigation.home')}</a></li>
                <li><a href="/profile">{l('navigation.profile')}</a></li>
                <li><a href="/logout">{l('navigation.logout')}</a></li>
            </ul>
        </nav>
    );
}