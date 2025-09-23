use crate::folder::domain::{Folder, FolderRepository};
use crate::database::infrastructure::get_db;
use uuid::Uuid;

pub struct InSqliteFolderRepository;

impl FolderRepository for InSqliteFolderRepository {
    fn create_folder(&self, folder_name: &str) -> Result<Folder, String> {
        Folder::validate_name(folder_name)?;
        
        let id = Uuid::new_v4().to_string();
        let conn = get_db().map_err(|e| e.to_string())?;
        
        conn.execute(
            "INSERT INTO folders (id, folder_name) VALUES (?1, ?2)",
            [&id, folder_name],
        ).map_err(|e| e.to_string())?;
        
        Ok(Folder::new(id, folder_name.to_string()))
    }

    fn get_folders(&self) -> Result<Vec<Folder>, String> {
        let conn = get_db().map_err(|e| e.to_string())?;
        let mut stmt = conn.prepare("SELECT id, folder_name FROM folders")
            .map_err(|e| e.to_string())?;
        
        let folder_rows = stmt.query_map([], |row| {
            Ok(Folder::new(
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?
            ))
        }).map_err(|e| e.to_string())?;

        let mut folders = Vec::new();
        for folder_result in folder_rows {
            folders.push(folder_result.map_err(|e| e.to_string())?);
        }
        
        Ok(folders)
    }

    fn delete_folder(&self, id: &str) -> Result<(), String> {
        if id.trim().is_empty() {
            return Err("Folder ID cannot be empty".to_string());
        }
        
        let conn = get_db().map_err(|e| e.to_string())?;
        let affected_rows = conn.execute("DELETE FROM folders WHERE id = ?1", [id])
            .map_err(|e| e.to_string())?;
            
        if affected_rows == 0 {
            return Err("Folder not found".to_string());
        }
        
        Ok(())
    }

    fn get_folder_by_id(&self, id: &str) -> Result<Option<Folder>, String> {
        if id.trim().is_empty() {
            return Err("Folder ID cannot be empty".to_string());
        }
        
        let conn = get_db().map_err(|e| e.to_string())?;
        let mut stmt = conn.prepare("SELECT id, folder_name FROM folders WHERE id = ?1")
            .map_err(|e| e.to_string())?;
        
        match stmt.query_row([id], |row| {
            Ok(Folder::new(
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?
            ))
        }) {
            Ok(folder) => Ok(Some(folder)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e.to_string()),
        }
    }

    fn update_folder(&self, id: &str, folder_name: &str) -> Result<Folder, String> {
        if id.trim().is_empty() {
            return Err("Folder ID cannot be empty".to_string());
        }
        
        Folder::validate_name(folder_name)?;
        
        let conn = get_db().map_err(|e| e.to_string())?;
        let affected_rows = conn.execute(
            "UPDATE folders SET folder_name = ?1 WHERE id = ?2",
            [folder_name, id],
        ).map_err(|e| e.to_string())?;
        
        if affected_rows == 0 {
            return Err("Folder not found".to_string());
        }
        
        Ok(Folder::new(id.to_string(), folder_name.to_string()))
    }
}
