import l from '../lib/i18n/localizer';


export default function FooterTermsPolicy()
{
    return (
        <footer className="absolute bottom-5 w-auto text-center mb-4">
            <ul className='flex p-3  flex-row gap-5 text-center'>
                <li><a href="/terms">{l('legal.terms')}</a></li>
                <li><a href="/privacy">{l('legal.privacy')}</a></li>
            </ul>
        </footer>
    );
}