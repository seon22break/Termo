#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Folder {
    pub id: String,
    pub folder_name: String,
}

impl Folder {
    pub fn new(id: String, folder_name: String) -> Self {
        Self { id, folder_name }
    }
    
    pub fn validate_name(name: &str) -> Result<(), String> {
        if name.trim().is_empty() {
            return Err("Folder name cannot be empty".to_string());
        }
        if name.len() > 255 {
            return Err("Folder name cannot exceed 255 characters".to_string());
        }
        Ok(())
    }
}
