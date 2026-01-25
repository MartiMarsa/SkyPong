'use client';


import { useState } from 'react';
import l from './lib/i18n/localizer';
import HeroUI from './ui/hero-ui';
import NavigationSignUI from './ui/navigation-sign-ui';
import PlayButtonUI from './ui/play-button-ui';
import FooterTermsPolicy from './ui/footer-terms-policy';
import ModalModeSelector from './ui/modal-mode-selector';

export default function HomePage()
{
  // ...
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlayButtonClick = () => {
    console.log("Play button clicked - opening modal");
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
  };    

  return (
    <>
        <NavigationSignUI />
        <main className='flex justify-center items-stretch min-h-screen align-stretch bg-gradient-to-b from-blue-100 to-blue-300'>
            <div className="main-content flex column justify-center align-center md:basis-3/4 lg:basis-1/2 flex flex-col">

                <HeroUI title={l('homePage.title')} subtitle={l('homePage.description')} imageUrl="/images/pongo-porco.png" isModalOpen={isModalOpen} />
                <div className="play-button-container flex justify-center">
                  {!isModalOpen && <PlayButtonUI onClick={handlePlayButtonClick} isModalOpen={isModalOpen} />}
                </div>
            </div>
            {isModalOpen && <ModalModeSelector close={handleCloseModal} isModalOpen={isModalOpen} />}
        </main>
        <FooterTermsPolicy />
    </>
  );
}