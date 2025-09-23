use super::folder::Folder;

pub trait FolderRepository {
    fn create_folder(&self, folder_name: &str) -> Result<Folder, String>;
    fn get_folders(&self) -> Result<Vec<Folder>, String>;
    fn delete_folder(&self, id: &str) -> Result<(), String>;
    fn get_folder_by_id(&self, id: &str) -> Result<Option<Folder>, String>;
    fn update_folder(&self, id: &str, folder_name: &str) -> Result<Folder, String>;
}
