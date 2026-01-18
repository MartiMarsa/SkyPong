import es from './locales/es';
import en from './locales/en';
import it from './locales/it';
import { getCurrentLocale } from './locale-manager';

const locales = { es, en, it };

export function l(key: string): string 
{
    // Select the appropriate locale dictionary from global var locales
    const locale = getCurrentLocale(); // Assume this function retrieves the current locale, e.g., 'en', 'es', 'it'
    key = key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : null, locales[locale]) || key; // Support nested keys like 'homePage.title'
    return locales[locale][key] || key;
}
