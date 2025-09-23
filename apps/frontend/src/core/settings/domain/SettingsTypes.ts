export interface SelectOption {
  value: string;
  label: string;
}

export interface SettingConfig {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'password' | 'select' | 'boolean';
  placeholder?: string;
  options?: SelectOption[];
  defaultValue?: string;
}

export interface SettingsConfiguration {
  settings: SettingConfig[];
}

export interface SettingValue {
  key: string;
  value: string;
  isConfigured: boolean;
  isDefault: boolean;
}

export interface SettingsRepository {
  getAvailableSettings(): Promise<SettingsConfiguration>;
  getSettingValues(): Promise<Record<string, string>>;
  updateSetting(key: string, value: string): Promise<void>;
}

export interface SettingsState {
  availableSettings: SettingConfig[];
  settingValues: Record<string, string>;
  isLoading: boolean;
  loadingSettings: Record<string, boolean>;
}
