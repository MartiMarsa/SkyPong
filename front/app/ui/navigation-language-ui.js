'use client';
import { useTranslation } from '../context/language-context';
import { useStyles } from '../hooks/use-styles';

const mobileStyles = {
  nav: 'flex items-center gap-2',
  langItem: 'rounded-md border-2 border-slate-700 bg-[#efefef] p-0.5',
  langButton:
    'rounded-sm border border-transparent bg-transparent px-3 py-1 text-sm font-semibold tracking-wide text-slate-900 transition hover:bg-slate-200',
};
const desktopStyles = { nav: '', langItem: '', langButton: '' };

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
