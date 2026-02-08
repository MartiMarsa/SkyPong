import { useTranslation } from "../hooks/use-translation";

export default function FooterTermsPolicy()
{
    const { t } = useTranslation();
    return (
        <footer className="absolute bottom-5 w-auto text-center mb-4">
            <ul className='flex p-3  flex-row gap-5 text-center'>
                <li><a href="/terms">{t.legal.terms}</a></li>
                <li><a href="/privacy">{t.legal.privacy}</a></li>
            </ul>
        </footer>
    );
}