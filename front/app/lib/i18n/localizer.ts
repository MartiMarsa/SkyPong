import es from './locales/es';
import en from './locales/en';
import it from './locales/it';
import { getCurrentLocale } from './locale-manager';

const locs = { es, en, it };

export default function l(key: string): string {
    const locale = getCurrentLocale(); // 'en', 'es', 'it'
    
    const value = key.split('.').reduce(
        (obj, k) => (obj && obj[k] !== undefined) ? obj[k] : null,
        locs[locale]
    );

    return value || key;
}

export function locales() : typeof locs
{
    return locs;
}