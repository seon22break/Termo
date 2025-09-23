import type { SettingsRepository, SettingsConfiguration, SettingConfig } from '../domain/SettingsTypes';
import type { Translation } from '../../../context/I18nContext';
import settingsConfig from '../../../assets/settings.json';

export class InAssetsSettingsRepositoryI18n implements SettingsRepository {
  private translations: Translation;

  constructor(translations: Translation) {
    this.translations = translations;
  }

  async getAvailableSettings(): Promise<SettingsConfiguration> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const translatedSettings = settingsConfig.settings.map((setting) => ({
          key: setting.key,
          label: this.translateString(setting.label),
          description: this.translateString(setting.description),
          type: setting.type as SettingConfig['type'],
          placeholder: ('placeholder' in setting && typeof setting.placeholder === 'string') ? setting.placeholder : undefined,
          defaultValue: setting.defaultValue,
          options: 'options' in setting && setting.options ? setting.options.map((option) => ({
            value: option.value,
            label: this.translateString(option.label)
          })) : undefined
        })) as SettingConfig[];

        resolve({
          settings: translatedSettings
        });
      }, 0);
    });
  }

  async getSettingValues(): Promise<Record<string, string>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedSettings = this.getStoredSettings();
        resolve(storedSettings);
      }, 0);
    });
  }

  async updateSetting(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          this.storeSettingValue(key, value);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  private translateString(str: string): string {
    if (!str.startsWith('@')) {
      return str;
    }

    const path = str.substring(1).split('.');
    
    try {
      let result: unknown = this.translations;
      for (const key of path) {
        if (result && typeof result === 'object' && key in result) {
          result = (result as Record<string, unknown>)[key];
        } else {
          return str;
        }
      }
      
      return typeof result === 'string' ? result : str;
    } catch {
      console.warn(`Translation not found for key: ${str}`);
      return str;
    }
  }

  private getStoredSettings(): Record<string, string> {
    try {
      const stored = localStorage.getItem('termo_settings');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading settings from storage:', error);
      return {};
    }
  }

  private storeSettingValue(key: string, value: string): void {
    try {
      const currentSettings = this.getStoredSettings();
      currentSettings[key] = value;
      localStorage.setItem('termo_settings', JSON.stringify(currentSettings));
    } catch (error) {
      console.error('Error storing setting:', error);
      throw new Error(`Failed to store setting ${key}: ${error}`);
    }
  }
}
