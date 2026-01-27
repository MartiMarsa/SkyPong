import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function HeroUI({ title, subtitle, isModalOpen })
{
    return (
        <section className={`hero-ui flex flex-col justify-center items-center mb-8`}>
            <div className="hero-content">
                <h1 className="hero-title text-4xl font-bold mb-4 text-center">{title}</h1>
                <p className="hero-subtitle text-lg text-center">{subtitle}</p>
            </div>
                <div className="hero-image">
                    <Link href='/game-mode'><FontAwesomeIcon icon={faPlay} /></Link>
            </div>
        </section>
    );
}