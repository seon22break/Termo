use crate::settings::domain::SettingsRepository;
use crate::settings::infrastructure::InSqliteSettingsRepository;

#[tauri::command]
pub fn read_setting_cmd(key: String) -> Result<Option<String>, String> {
    let repository = InSqliteSettingsRepository;
    repository.read_setting(&key)
}

#[tauri::command]
pub fn write_setting_cmd(key: String, value: String) -> Result<(), String> {
    let repository = InSqliteSettingsRepository;
    repository.write_setting(&key, &value)
}
