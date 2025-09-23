use super::setting::Setting;

pub trait SettingsRepository {
    fn read_setting(&self, key: &str) -> Result<Option<String>, String>;
    fn write_setting(&self, key: &str, value: &str) -> Result<(), String>;
    fn get_setting(&self, key: &str) -> Result<Option<Setting>, String>;
    fn save_setting(&self, setting: Setting) -> Result<(), String>;
    fn get_all_settings(&self) -> Result<Vec<Setting>, String>;
    fn get_settings_by_prefix(&self, prefix: &str) -> Result<Vec<Setting>, String>;
}
