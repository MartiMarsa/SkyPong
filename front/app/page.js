'use client';

import { useStyles } from './hooks/use-styles';
import FooterTermsPolicy from './ui/footer-terms-policy';
import HeroUI from './ui/hero-ui';
import NavigationAppUI from './ui/navigation-app-ui';
import NavigationLanguageUI from './ui/navigation-language-ui';

const mobileStyles = {
  main: 'min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-slate-100',
};

const desktopStyles = {
  main: 'md:px-10',
};

export default function HomePage() {
  const { styles } = useStyles(mobileStyles, desktopStyles);

  return (
    <main className={styles.main}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-4 py-6 sm:px-8 sm:py-8">
        <NavigationAppUI userURL="/login" />

        <section className="flex flex-1 flex-col items-center justify-center gap-8 py-8 md:gap-10 md:py-12">
          <div className="w-full rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-sm sm:p-8 md:p-10">
            <HeroUI />
          </div>

          <div className="rounded-full border border-slate-700/60 bg-slate-900/70 px-5 py-2 shadow-lg shadow-slate-950/40 backdrop-blur-sm">
            <NavigationLanguageUI />
          </div>
        </section>

        <div className="pt-4 text-slate-300">
          <FooterTermsPolicy />
        </div>
      </div>
    </main>
  );
}
