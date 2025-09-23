use crate::settings::domain::{Setting, SettingsRepository};
use crate::database::infrastructure::get_db;
use rusqlite::{Result, Error};

pub struct InSqliteSettingsRepository;

impl SettingsRepository for InSqliteSettingsRepository {
    fn read_setting(&self, key: &str) -> Result<Option<String>, String> {
        let conn = get_db().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT value FROM settings WHERE key = ?1")
            .map_err(|e| e.to_string())?;
        
        match stmt.query_row([key], |row| row.get::<_, String>(0)) {
            Ok(value) => Ok(Some(value)),
            Err(Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e.to_string())
        }
    }

    fn write_setting(&self, key: &str, value: &str) -> Result<(), String> {
        let conn = get_db().map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
            [key, value]
        )
        .map_err(|e| e.to_string())?;
        
        Ok(())
    }

    fn get_setting(&self, key: &str) -> Result<Option<Setting>, String> {
        let conn = get_db().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT key, value FROM settings WHERE key = ?1")
            .map_err(|e| e.to_string())?;
        
        match stmt.query_row([key], |row| {
            Ok(Setting::new(
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?
            ))
        }) {
            Ok(setting) => Ok(Some(setting)),
            Err(Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e.to_string())
        }
    }

    fn save_setting(&self, setting: Setting) -> Result<(), String> {
        self.write_setting(&setting.key, &setting.value)
    }

    fn get_all_settings(&self) -> Result<Vec<Setting>, String> {
        let conn = get_db().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT key, value FROM settings")
            .map_err(|e| e.to_string())?;
        
        let setting_rows = stmt.query_map([], |row| {
            Ok(Setting::new(
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?
            ))
        }).map_err(|e| e.to_string())?;

        let mut settings = Vec::new();
        for setting_result in setting_rows {
            settings.push(setting_result.map_err(|e| e.to_string())?);
        }
        
        Ok(settings)
    }

    fn get_settings_by_prefix(&self, prefix: &str) -> Result<Vec<Setting>, String> {
        let conn = get_db().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT key, value FROM settings WHERE key LIKE ?1")
            .map_err(|e| e.to_string())?;
        
        let search_pattern = format!("{}%", prefix);
        let setting_rows = stmt.query_map([search_pattern], |row| {
            Ok(Setting::new(
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?
            ))
        }).map_err(|e| e.to_string())?;

        let mut settings = Vec::new();
        for setting_result in setting_rows {
            settings.push(setting_result.map_err(|e| e.to_string())?);
        }
        
        Ok(settings)
    }
}
