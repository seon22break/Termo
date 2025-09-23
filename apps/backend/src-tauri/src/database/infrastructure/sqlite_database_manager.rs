use crate::database::domain::DatabaseManager;
use rusqlite::{Connection as SqliteConnection, Result};
use std::path::PathBuf;
use std::sync::OnceLock;
use tauri::AppHandle;

static DB_PATH: OnceLock<PathBuf> = OnceLock::new();

fn get_db_path() -> Result<PathBuf, String> {
    DB_PATH.get()
        .cloned()
        .ok_or_else(|| "Database path not initialized".to_string())
}

pub fn init_db_path(_app: &AppHandle) -> Result<(), String> {
    let db_path = get_installation_db_path()?;
    
    // Ensure the parent directory exists
    if let Some(parent_dir) = db_path.parent() {
        if !parent_dir.exists() {
            std::fs::create_dir_all(parent_dir)
                .map_err(|e| format!("Failed to create database directory: {}", e))?;
        }
    }
    
    DB_PATH.set(db_path.clone())
        .map_err(|_| "Database path already initialized")?;
    
    println!("Database will be stored at: {:?}", db_path);
    Ok(())
}

fn get_installation_db_path() -> Result<PathBuf, String> {
    // First try the installation directory (for portable mode)
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let db_path = exe_dir.join("connections.db");
            // Test if we can write to the installation directory
            if test_write_permission(&exe_dir) {
                return Ok(db_path);
            }
        }
    }
    
    // Fallback to AppData\Local\Termo (user writable location)
    let local_app_data = std::env::var("LOCALAPPDATA")
        .or_else(|_| std::env::var("APPDATA"))
        .map_err(|_| "Cannot find user data directory")?;
    
    let app_data_dir = PathBuf::from(local_app_data).join("Termo");
    Ok(app_data_dir.join("connections.db"))
}

fn test_write_permission(dir: &std::path::Path) -> bool {
    let test_file = dir.join(".termo_write_test");
    match std::fs::write(&test_file, "test") {
        Ok(()) => {
            let _ = std::fs::remove_file(&test_file);
            true
        }
        Err(_) => false
    }
}

pub struct SqliteDatabaseManager;

impl DatabaseManager for SqliteDatabaseManager {
    fn initialize_database(&self) -> Result<(), String> {
        let conn = self.get_connection()?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )",
            [],
        ).map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES (?1, ?2)",
            ["language", "en"],
        ).map_err(|e| e.to_string())?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS folders (
                id TEXT PRIMARY KEY,
                folder_name TEXT NOT NULL
            )",
            [],
        ).map_err(|e| e.to_string())?;
        
        conn.execute(
            "INSERT OR IGNORE INTO folders (id, folder_name) VALUES (?1, ?2)",
            ["eec658fa-edd1-4fe9-b36e-a90ece79ce27", "default"],
        ).map_err(|e| e.to_string())?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS connections (
                id TEXT PRIMARY KEY,
                host TEXT NOT NULL,
                port INTEGER NOT NULL DEFAULT 22,
                display_name TEXT NOT NULL,
                user TEXT NOT NULL,
                password TEXT,
                sshkey TEXT,
                icon TEXT,
                folder_id TEXT NOT NULL DEFAULT 'eec658fa-edd1-4fe9-b36e-a90ece79ce27',
                FOREIGN KEY(folder_id) REFERENCES folders(id)
            )",
            [],
        ).map_err(|e| e.to_string())?;

        Ok(())
    }
    
    fn check_or_create_database(&self) -> Result<(), String> {
        let db_path = get_db_path()?;
        if !db_path.exists() {
            self.initialize_database()?;
        }
        Ok(())
    }
    
    fn get_connection(&self) -> Result<SqliteConnection, String> {
        let db_path = get_db_path()?;
        SqliteConnection::open(db_path).map_err(|e| e.to_string())
    }
}

pub fn get_db() -> Result<SqliteConnection> {
    let db_path = get_db_path().map_err(|e| {
        rusqlite::Error::SqliteFailure(
            rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_CANTOPEN), 
            Some(e)
        )
    })?;
    SqliteConnection::open(db_path)
}

pub fn init_db() -> Result<()> {
    let manager = SqliteDatabaseManager;
    manager.initialize_database().map_err(|e| {
        rusqlite::Error::SqliteFailure(
            rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_CANTOPEN), 
            Some(e)
        )
    })
}

pub fn check_or_create_db() -> Result<()> {
    let manager = SqliteDatabaseManager;
    manager.check_or_create_database().map_err(|e| {
        rusqlite::Error::SqliteFailure(
            rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_CANTOPEN), 
            Some(e)
        )
    })
}

pub fn get_database_path() -> PathBuf {
    get_db_path().unwrap_or_else(|_| PathBuf::from("connections.db"))
}

pub fn delete_database() -> Result<(), String> {
    let db_path = get_database_path();
    
    if db_path.exists() {
        std::fs::remove_file(&db_path)
            .map_err(|e| format!("Error deleting database: {}", e))?;
        Ok(())
    } else {
        Err("Database does not exist".to_string())
    }
}
