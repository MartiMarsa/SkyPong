import { l } from '../lib/i18n/localizer';

export default function NavigationSignUI() 
{
    return (
        <nav className="navigation-sign-ui absolute top-0 left-0 w-full flex justify-end p-4 bg-white bg-opacity-75 shadow-md">
            <ul className="nav-links">
                <li><a href="/signin">{l('signInPage.title')}</a></li>
                <li><a href="/signup">{l('signUpPage.title')}</a></li>
            </ul>
        </nav>
    );
}