import React, { useEffect } from 'react';
import { useI18n } from '../../context/I18nContext';


export const I18nLanguageSync: React.FC = () => {
  const { language, setLanguage } = useI18n();

  useEffect(() => {
    const handleLanguageSettingChange = (event: CustomEvent) => {
      if (event.detail?.key === 'language' && event.detail?.value !== language) {
        console.log(`🌐 Language setting changed to: ${event.detail.value}`);
        setLanguage(event.detail.value);
      }
    };

    window.addEventListener('setting_changed', handleLanguageSettingChange as EventListener);

    return () => {
      window.removeEventListener('setting_changed', handleLanguageSettingChange as EventListener);
    };
  }, [language, setLanguage]);

  return null;
};
