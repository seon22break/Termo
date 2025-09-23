use crate::database::domain::DatabaseManager;
use crate::database::infrastructure::{SqliteDatabaseManager, delete_database};
use tauri::AppHandle;

#[tauri::command]
pub fn initialize_database_cmd() -> Result<(), String> {
    println!("Initializing database");
    
    let db_manager = SqliteDatabaseManager;
    db_manager.initialize_database()
}

#[tauri::command]
pub fn delete_database_cmd(app_handle: AppHandle) -> Result<String, String> {
    println!("Deleting database");
    
    delete_database()?;
    
    app_handle.exit(0);
    
    Ok("Database deleted successfully".to_string())
}
