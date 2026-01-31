import { useTranslation } from '../hooks/use-translation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';

export default function UserMenuUI({ userURL })
{
    const { t } = useTranslation();
    return (
            <Link href={ userURL } className="user-menu">
                <FontAwesomeIcon icon={faCircleUser} />
            </Link>
    );
}