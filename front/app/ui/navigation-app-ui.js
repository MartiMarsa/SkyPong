import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from '../hooks/use-translation';
import { useStyles } from '../hooks/use-styles';
import { useAuth } from '../context/auth-context';
import HomeButtonUi from './home-button-ui.js';
import UserMenuUI from './user-menu-ui.js';

const mobileStyles = {
  nav: 'flex items-center justify-between p-2 text-3xl',
};

const desktopStyles = {
  nav: 'flex items-center justify-between p-2 text-3xl',
};

export default function NavigationAppUI({ home, userURL, compactGuestActions = false }) {
  const { t } = useTranslation();
  const { styles } = useStyles(mobileStyles, desktopStyles);
  const { user, logout } = useAuth();

  const showGuestActions = !user;

  return (
    <nav className={styles.nav}>
      {home ? <HomeButtonUi url={home} /> : <div />}

      {showGuestActions ? (
        compactGuestActions ? (
          <div className="ml-auto flex items-center gap-3 text-base font-medium text-slate-900">
            <Link href="/login" className="transition hover:opacity-70">
              Log in
            </Link>
            <span>/</span>
            <Link href="/signup" className="transition hover:opacity-70">
              Sign Up
            </Link>
            <Link href="/signup" aria-label="Open sign up" className="text-4xl transition hover:opacity-70">
              <FontAwesomeIcon icon={faCircleUser} />
            </Link>
          </div>
        ) : (
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg border border-slate-400/40 bg-transparent px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-200 hover:bg-slate-700/40"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Login
            </Link>
          </div>
        )
      ) : (
        <div className="ml-auto flex items-center gap-4 text-base sm:text-lg">
          {!home && (
            <Link href="/" onClick={() => logout()}>
              {t.navigation.logout}
            </Link>
          )}
          {userURL && <UserMenuUI userURL={userURL} />}
        </div>
      )}
    </nav>
  );
}
