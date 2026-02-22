'use client';

import { useStyles } from './hooks/use-styles';
import FooterTermsPolicy from './ui/footer-terms-policy';
import HeroUI from './ui/hero-ui';
import NavigationAppUI from './ui/navigation-app-ui';
import NavigationLanguageUI from './ui/navigation-language-ui';

const mobileStyles = {
  main: 'min-h-screen bg-[#d9d9d9] text-slate-900',
};

const desktopStyles = {
  main: 'md:px-10',
};

export default function HomePage() {
  const { styles } = useStyles(mobileStyles, desktopStyles);

  return (
    <main className={styles.main}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between rounded-[2.5rem] border-2 border-slate-700 px-4 py-6 sm:px-8 sm:py-8">
        <NavigationAppUI userURL="/login" compactGuestActions />

        <section className="flex flex-1 flex-col items-center justify-center gap-8 py-8 md:gap-10 md:py-12">
          <div className="w-full max-w-4xl p-6 sm:p-8 md:p-10">
            <HeroUI />
          </div>

          <div>
            <NavigationLanguageUI />
          </div>
        </section>

        <div className="pt-4 text-slate-800">
          <FooterTermsPolicy />
        </div>
      </div>
    </main>
  );
}
