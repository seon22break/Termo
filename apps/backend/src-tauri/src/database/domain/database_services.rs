pub trait DatabaseManager {
    fn initialize_database(&self) -> Result<(), String>;
    fn check_or_create_database(&self) -> Result<(), String>;
    fn get_connection(&self) -> Result<rusqlite::Connection, String>;
}
