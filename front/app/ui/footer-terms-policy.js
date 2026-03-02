import { useTranslation } from "../hooks/use-translation";

export default function FooterTermsPolicy()
{
    const { t } = useTranslation();
    return (
        <footer className="mb-2 w-full text-center">
            <ul className='flex flex-row items-center justify-center gap-2 p-3 text-lg'>
                <li><a href="/privacy">{t.legal.privacy}</a></li>
                <li>and</li>
                <li><a href="/terms">{t.legal.terms}</a></li>
            </ul>
        </footer>
    );
}
