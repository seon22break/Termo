import React, { createContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { InAssetsSettingsRepository } from './infrastructure/InAssetsSettingsRepository';
import { ObtainSettingsToShow } from './application/ObtainSettingsToShow';
import type { SettingsState, SettingConfig } from './domain/SettingsTypes';

export interface SettingsContextValue {
  settingsState: SettingsState;
  loadSettings: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  getSettingCurrentValue: (settingConfig: SettingConfig) => string;
  isSettingConfigured: (settingKey: string) => boolean;
  isSettingLoading: (settingKey: string) => boolean;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const repository = useMemo(() => new InAssetsSettingsRepository(), []);
  const obtainSettingsToShow = useMemo(() => new ObtainSettingsToShow(repository), [repository]);

  const [settingsState, setSettingsState] = useState<SettingsState>({
    availableSettings: [],
    settingValues: {},
    isLoading: true,
    loadingSettings: {}
  });

  const loadSettings = useCallback(async () => {
    try {
      setSettingsState((prev: SettingsState) => ({ ...prev, isLoading: true }));
      const newState = await obtainSettingsToShow.execute();
      setSettingsState(newState);
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettingsState((prev: SettingsState) => ({ 
        ...prev, 
        isLoading: false 
      }));
    }
  }, [obtainSettingsToShow]);

  const updateSetting = useCallback(async (key: string, value: string) => {
    try {
      setSettingsState((prev: SettingsState) => ({
        ...prev,
        loadingSettings: { ...prev.loadingSettings, [key]: true }
      }));

      await repository.updateSetting(key, value);

      setSettingsState((prev: SettingsState) => ({
        ...prev,
        settingValues: { ...prev.settingValues, [key]: value },
        loadingSettings: { ...prev.loadingSettings, [key]: false }
      }));

    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      
      setSettingsState((prev: SettingsState) => ({
        ...prev,
        loadingSettings: { ...prev.loadingSettings, [key]: false }
      }));
      
      throw error;
    }
  }, [repository]);

  // Utilidades
  const getSettingCurrentValue = useCallback((settingConfig: SettingConfig): string => {
    return obtainSettingsToShow.getSettingCurrentValue(settingConfig, settingsState.settingValues);
  }, [obtainSettingsToShow, settingsState.settingValues]);

  const isSettingConfigured = useCallback((settingKey: string): boolean => {
    return obtainSettingsToShow.isSettingConfigured(settingKey, settingsState.settingValues);
  }, [obtainSettingsToShow, settingsState.settingValues]);

  const isSettingLoading = useCallback((settingKey: string): boolean => {
    return settingsState.loadingSettings[settingKey] || false;
  }, [settingsState.loadingSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const contextValue: SettingsContextValue = {
    settingsState,
    loadSettings,
    updateSetting,
    getSettingCurrentValue,
    isSettingConfigured,
    isSettingLoading
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};
