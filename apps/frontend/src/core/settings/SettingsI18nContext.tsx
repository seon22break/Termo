import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { SettingsState, SettingConfig } from './domain/SettingsTypes';
import { InAssetsSettingsRepositoryI18n } from './infrastructure/InAssetsSettingsRepositoryI18n';
import { ObtainSettingsToShow } from './application/ObtainSettingsToShow';
import { useI18n } from '../../context/I18nContext';

export interface SettingsI18nContextValue {
  settingsState: SettingsState;
  
  updateSetting: (key: string, value: string) => Promise<void>;
  
  getSettingCurrentValue: (settingConfig: SettingConfig) => string;
  isSettingConfigured: (settingKey: string) => boolean;
  isSettingLoading: (settingKey: string) => boolean;
}

const SettingsI18nContext = createContext<SettingsI18nContextValue | undefined>(undefined);

interface SettingsI18nProviderProps {
  children: ReactNode;
}

export const SettingsI18nProvider: React.FC<SettingsI18nProviderProps> = ({ children }) => {
  const { t, language, setLanguage } = useI18n();
  const [settingsState, setSettingsState] = useState<SettingsState>({
    availableSettings: [],
    settingValues: {},
    isLoading: true,
    loadingSettings: {}
  });

  const repository = useMemo(() => new InAssetsSettingsRepositoryI18n(t), [t]);
  const obtainSettingsUseCase = useMemo(() => new ObtainSettingsToShow(repository), [repository]);

  useEffect(() => {
    const loadSettings = async () => {
      setSettingsState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const settings = await obtainSettingsUseCase.execute();
        setSettingsState({
          availableSettings: settings.availableSettings,
          settingValues: settings.settingValues,
          isLoading: false,
          loadingSettings: {}
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettingsState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadSettings();
  }, [language, obtainSettingsUseCase]);

  const updateSetting = async (key: string, value: string) => {
    setSettingsState(prev => ({
      ...prev,
      loadingSettings: { ...prev.loadingSettings, [key]: true }
    }));

    try {
      await repository.updateSetting(key, value);
      
      if (key === 'language') {
        await setLanguage(value as 'es' | 'en');
      }
      
      setSettingsState(prev => ({
        ...prev,
        settingValues: { ...prev.settingValues, [key]: value },
        loadingSettings: { ...prev.loadingSettings, [key]: false }
      }));
      
      window.dispatchEvent(new CustomEvent('setting_changed', {
        detail: { key, value }
      }));
      
    } catch (error) {
      setSettingsState(prev => ({
        ...prev,
        loadingSettings: { ...prev.loadingSettings, [key]: false }
      }));
      throw error;
    }
  };

  const getSettingCurrentValue = (settingConfig: SettingConfig) => {
    return obtainSettingsUseCase.getSettingCurrentValue(settingConfig, settingsState.settingValues);
  };

  const isSettingConfigured = (key: string) => {
    return obtainSettingsUseCase.isSettingConfigured(key, settingsState.settingValues);
  };

  const isSettingLoading = (key: string) => {
    return settingsState.loadingSettings[key] || false;
  };

  const contextValue: SettingsI18nContextValue = {
    settingsState,
    updateSetting,
    getSettingCurrentValue,
    isSettingConfigured,
    isSettingLoading
  };

  return (
    <SettingsI18nContext.Provider value={contextValue}>
      {children}
    </SettingsI18nContext.Provider>
  );
};

export { SettingsI18nContext };
