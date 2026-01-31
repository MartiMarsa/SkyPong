import { useTranslation } from '../hooks/use-translation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';

export default function HomeButtonUI({ url })
{
    const { t } = useTranslation();
    return (
        <Link href={ url } className="home-button">
            <label className="nav-menu-item-lable hidden">{t.homePage.label}</label>
            <FontAwesomeIcon icon={ faHouse } />
        </Link>
    );
}