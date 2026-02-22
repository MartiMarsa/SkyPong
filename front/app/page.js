'use client';

import { useStyles } from './hooks/use-styles';
import FooterTermsPolicy from './ui/footer-terms-policy';
import HeroUI from './ui/hero-ui';
import NavigationAppUI from './ui/navigation-app-ui';
import NavigationLanguageUI from './ui/navigation-language-ui';

const mobileStyles = {
  main: 'h-dvh w-screen overflow-hidden bg-[#d9d9d9] text-slate-900',
};

const desktopStyles = {
  main: 'h-dvh w-screen overflow-hidden bg-[#d9d9d9] px-4 text-slate-900 sm:px-6 lg:px-10',
};

export default function HomePage() {
  const { styles } = useStyles(mobileStyles, desktopStyles);

  return (
    <main className={styles.main}>
      <div className="mx-auto flex h-full w-full flex-col rounded-[2.5rem] border-2 border-slate-700 px-4 py-4 sm:px-8 sm:py-6 lg:py-8">
        <NavigationAppUI userURL="/login" compactGuestActions />

        <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 py-4 md:gap-8 md:py-6 lg:gap-10 lg:py-10">
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
