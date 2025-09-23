use crate::folder::domain::{FolderRepository, Folder};
use crate::folder::infrastructure::InSqliteFolderRepository;

#[tauri::command]
pub fn create_folder_cmd(folder_name: String) -> Result<Folder, String> {
    let folder_repo = InSqliteFolderRepository;
    folder_repo.create_folder(&folder_name)
}

#[tauri::command]
pub fn get_folders_cmd() -> Result<Vec<Folder>, String> {
    let folder_repo = InSqliteFolderRepository;
    folder_repo.get_folders()
}

#[tauri::command]
pub fn delete_folder_cmd(id: String) -> Result<(), String> {
    
    let folder_repo = InSqliteFolderRepository;
    folder_repo.delete_folder(&id)
}

#[tauri::command]
pub fn get_folder_by_id_cmd(id: String) -> Result<Option<Folder>, String> {
    let folder_repo = InSqliteFolderRepository;
    folder_repo.get_folder_by_id(&id)
}

#[tauri::command]
pub fn update_folder_cmd(id: String, folder_name: String) -> Result<Folder, String> {
    let folder_repo = InSqliteFolderRepository;
    folder_repo.update_folder(&id, &folder_name)
}
