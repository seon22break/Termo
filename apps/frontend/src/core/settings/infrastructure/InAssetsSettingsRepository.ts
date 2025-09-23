import type { SettingsRepository, SettingsConfiguration, SettingConfig } from '../domain/SettingsTypes';
import settingsConfig from '../../../assets/settings.json';

export class InAssetsSettingsRepository implements SettingsRepository {
  
  async getAvailableSettings(): Promise<SettingsConfiguration> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          settings: settingsConfig.settings as SettingConfig[]
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
