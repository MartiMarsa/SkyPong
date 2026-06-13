'use client';

import { useState, useEffect, useRef } from 'react';
import NavigationAppUI from '../ui/navigation-app-ui';
import FooterTermsPolicy from '../ui/footer-terms-policy';

const TEAM = [
  { name: 'MARTI',   img: '/assets/DEVS/MARTI.png',   linkedin: 'https://www.linkedin.com/in/marti-marsa/',         github: 'https://github.com/MartiMarsa'  },
  { name: 'YAJAIRA', img: '/assets/DEVS/YAJAIRA.png',  linkedin: 'https://www.linkedin.com/in/yajaira-naranjo/',     github: 'https://github.com/yanaranj42' },
  { name: 'HUGO',    img: '/assets/DEVS/HUGO.png',     linkedin: 'https://www.linkedin.com/in/hugomontoyavazquez/', github: 'https://github.com/gugor'      },
  { name: 'ILYA',    img: '/assets/DEVS/ILYA.png',     linkedin: 'https://www.linkedin.com/in/ilyarozhkov/',        github: 'https://github.com/ilropd'     },
  { name: 'FABIO',   img: '/assets/DEVS/FABIO.png',    linkedin: 'https://www.linkedin.com/in/fabiodicecca/',       github: 'https://github.com/fabbbiodc'  },
];

const RADIUS = 180;
const SPEED  = 0.008; // deg/ms → ~45s per revolution

export default function DevTeamPage() {
  const [selected, setSelected] = useState(null);

  const itemRefs  = useRef([]);
  const angleRef  = useRef(0);
  const pausedRef = useRef(false);

  function openDev(dev) {
    pausedRef.current = true;
    setSelected(dev);
  }

  function closeDev() {
    pausedRef.current = false;
    setSelected(null);
  }

  useEffect(() => {
    let raf;
    let lastTime = null;

    const loop = (time) => {
      if (!pausedRef.current) {
        if (lastTime !== null) {
          angleRef.current = (angleRef.current + SPEED * (time - lastTime)) % 360;
        }
        lastTime = time;

        TEAM.forEach((_, i) => {
          const θ = ((angleRef.current + i * (360 / TEAM.length)) * Math.PI) / 180;
          const x = Math.cos(θ) * RADIUS;
          const y = Math.sin(θ) * RADIUS;
          if (itemRefs.current[i]) {
            itemRefs.current[i].style.transform =
              `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
          }
        });
      } else {
        lastTime = null;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <main className="h-dvh bg-page-bg flex flex-col">
      <NavigationAppUI />

      <div className="flex flex-1 items-center justify-center flex-col gap-6">
        <h1 className="font-display text-3xl font-bold text-center appear">Dev Team</h1>

        <div className="devteam-orbit-stage">
          {TEAM.map((dev, i) => (
            <div
              key={dev.name}
              ref={el => { itemRefs.current[i] = el; }}
              className="devteam-orbit-item"
              onClick={() => openDev(dev)}
              title={dev.name}
            >
              <img src={dev.img} alt={dev.name} />
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="devteam-modal-overlay" onClick={closeDev}>
          <div className="devteam-modal-card" onClick={e => e.stopPropagation()}>
            <button className="devteam-modal-close" onClick={closeDev}>✕</button>
            <img src={selected.img} className="devteam-modal-photo" alt={selected.name} />
            <div className="devteam-modal-info">
              <h2 className="font-display text-2xl font-bold text-white">{selected.name}</h2>
              <div className="devteam-modal-links">
                <a href={selected.linkedin} target="_blank" rel="noopener noreferrer" className="devteam-link-btn">LinkedIn</a>
                <a href={selected.github}   target="_blank" rel="noopener noreferrer" className="devteam-link-btn devteam-link-btn--gh">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto pb-4">
        <FooterTermsPolicy />
      </div>
    </main>
  );
}
