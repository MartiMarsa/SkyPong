'use client';

import { useState, useEffect } from 'react';
import { getCurrentLocale } from '../lib/i18n/locale-manager';
// Importa tus objetos de idiomas
import es from '../lib/i18n/locales/es';
import en from '../lib/i18n/locales/en';
import it from '../lib/i18n/locales/it';

const dictionaries: Record<string, any> = { es, en, it };

export const useTranslation = () => {
  const [locale, setLocale] = useState('es');

  useEffect(() => {
    // Al montar el componente, leemos el locale actual
    setLocale(getCurrentLocale());
  }, []);

  const t = dictionaries[locale] || dictionaries['es'];

  return { t, locale };
};