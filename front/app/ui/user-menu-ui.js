import { useTranslation } from '../hooks/use-translation';
import { useAuth } from '../context/auth-context';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';

export default function UserMenuUI({ userURL })
{
    const { t } = useTranslation();
    const { user } = useAuth();
    return (
        <>
        { !user ? (
            <Link href={ userURL } className="user-menu">
                <FontAwesomeIcon icon={faCircleUser} />
            </Link>
            ) :
            (
                <div className=''>
                    { console.info("User:", user)}
                    {t.user.hi}, 
                    <Link href={ !user ? (userURL) : (`/you`) } className="user-menu">
                        { user?.nickname || " SkyPong" }
                    </Link>

                </div>
            )
        }
        </>
    );
}