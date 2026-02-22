'use client';
import { useTranslation } from '../context/language-context';
import { useStyles } from '../hooks/use-styles';

const mobileStyles = {
  nav: 'flex items-center gap-4',
  langItem: 'rounded-xl border border-slate-600/70 bg-slate-800/70 p-1 shadow-md shadow-slate-950/50',
  langButton:
    'rounded-lg border border-slate-400/40 bg-slate-900/80 px-4 py-2 text-sm font-semibold tracking-wide text-slate-100 transition hover:border-slate-200 hover:bg-slate-700/50',
};
const desktopStyles = {
  nav: 'flex items-center gap-4',
  langItem: 'rounded-xl border border-slate-600/70 bg-slate-800/70 p-1 shadow-md shadow-slate-950/50',
  langButton:
    'rounded-lg border border-slate-400/40 bg-slate-900/80 px-4 py-2 text-sm font-semibold tracking-wide text-slate-100 transition hover:border-slate-200 hover:bg-slate-700/50',
};

export default function NavigationLanguageUI() {
  const { styles } = useStyles(mobileStyles, desktopStyles);
  const { changeLanguage } = useTranslation();

  return (
    <nav className={styles.nav}>
      <div className={styles.langItem}>
        <button type="button" onClick={() => changeLanguage('es')} className={styles.langButton}>
          ESP
        </button>
      </div>
      <div className={styles.langItem}>
        <button type="button" onClick={() => changeLanguage('en')} className={styles.langButton}>
          ENG
        </button>
      </div>
      <div className={styles.langItem}>
        <button type="button" onClick={() => changeLanguage('it')} className={styles.langButton}>
          ITA
        </button>
      </div>
    </nav>
  );
}
