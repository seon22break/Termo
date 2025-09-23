import { useContext } from 'react';
import { I18nContext } from './I18nContext';
import type { I18nContextValue } from './types';

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n has been called outside of I18nProvider');
  }
  return context;
};
