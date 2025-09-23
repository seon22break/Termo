import type { SettingsRepository, SettingConfig, SettingsState } from '../domain/SettingsTypes';

export class ObtainSettingsToShow {
  private repository: SettingsRepository;

  constructor(repository: SettingsRepository) {
    this.repository = repository;
  }

  async execute(): Promise<SettingsState> {
    try {
      const [availableSettings, settingValues] = await Promise.all([
        this.repository.getAvailableSettings(),
        this.repository.getSettingValues()
      ]);

      return {
        availableSettings: availableSettings.settings,
        settingValues,
        isLoading: false,
        loadingSettings: {}
      };
    } catch (error) {
      console.error('Error obtaining settings to show:', error);
      throw new Error('Failed to load settings configuration');
    }
  }

  getSettingCurrentValue(
    settingConfig: SettingConfig, 
    settingValues: Record<string, string>
  ): string {
    return settingValues[settingConfig.key] || settingConfig.defaultValue || '';
  }

  isSettingConfigured(
    settingKey: string, 
    settingValues: Record<string, string>
  ): boolean {
    return Object.prototype.hasOwnProperty.call(settingValues, settingKey);
  }
}
