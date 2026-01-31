'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentLocale, setCurrentLocale } from '../lib/i18n/locale-manager';
import es from '../lib/i18n/locales/es';
import en from '../lib/i18n/locales/en';
import it from '../lib/i18n/locales/it';

const dictionaries: Record<string, any> = { es, en, it };

const LanguageContext = createContext<any>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState('es'); // Estado inicial

  useEffect(() => {
    // Solo se ejecuta una vez al cargar la app
    setLocale(getCurrentLocale());
  }, []);

  const changeLanguage = (newLocale: string) => {
    setLocale(newLocale);       // Actualiza la UI al instante
    setCurrentLocale(newLocale); // Guarda en la cookie para la próxima visita
    window.location.reload();  // Recarga la página para aplicar el cambio
  };

  const t = dictionaries[locale] || dictionaries['es'];

  return (
    <LanguageContext.Provider value={{ t, locale, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);