import { useContext } from 'react';
import { SettingsI18nContext } from './SettingsI18nContext';
import type { SettingsI18nContextValue } from './SettingsI18nContext';

export const useSettingsI18n = (): SettingsI18nContextValue => {
  const context = useContext(SettingsI18nContext);
  if (!context) {
    throw new Error('useSettingsI18n has been called outside of SettingsI18nProvider');
  }
  return context;
};
