import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Translation, Language, I18nContextValue } from './types';

import esTranslations from '../../assets/i18n/es.json';
import enTranslations from '../../assets/i18n/en.json';

const translations: Record<Language, Translation> = {
  es: esTranslations as Translation,
  en: enTranslations as Translation
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es'); 
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await invoke<string>('read_setting_cmd', { key: 'language' });
        
        if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.log(error);
        setLanguageState('es');
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    try {
      setIsLoading(true);
      
      await invoke('write_setting_cmd', { 
        key: 'language', 
        value: newLanguage 
      });
      
      setLanguageState(newLanguage);
      
    } catch (error) {
        console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTranslations = translations[language] || translations.es;

  const contextValue: I18nContextValue = {
    language,
    setLanguage,
    t: currentTranslations,
    isLoading
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

export { I18nContext };
