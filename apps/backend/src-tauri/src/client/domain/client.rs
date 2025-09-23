use super::client_type::ClientType;
use crate::connection::domain::Connection;
use crate::folder::domain::Folder;
use crate::settings::domain::Setting;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Client {
    pub client_type: ClientType,
    pub operating_system: String,
    pub connections: Vec<Connection>,
    pub folders: Vec<Folder>,
    pub settings: Vec<Setting>,
}

impl Client {
    pub fn new(client_type: ClientType, operating_system: String) -> Self {
        Self {
            client_type,
            operating_system,
            connections: Vec::new(),
            folders: Vec::new(),
            settings: Vec::new(),
        }
    }
    
    pub fn with_data(
        client_type: ClientType,
        operating_system: String,
        connections: Vec<Connection>,
        folders: Vec<Folder>,
        settings: Vec<Setting>,
    ) -> Self {
        Self {
            client_type,
            operating_system,
            connections,
            folders,
            settings,
        }
    }
    
    // Connection methods
    pub fn add_connection(&mut self, connection: Connection) {
        self.connections.push(connection);
    }
    
    pub fn get_connections(&self) -> &Vec<Connection> {
        &self.connections
    }
    
    pub fn get_connection_by_id(&self, id: &str) -> Option<&Connection> {
        self.connections.iter().find(|conn| conn.id == id)
    }
    
    // Folder methods
    pub fn add_folder(&mut self, folder: Folder) {
        self.folders.push(folder);
    }
    
    pub fn get_folders(&self) -> &Vec<Folder> {
        &self.folders
    }
    
    pub fn get_folder_by_id(&self, id: &str) -> Option<&Folder> {
        self.folders.iter().find(|folder| folder.id == id)
    }
    
    // Setting methods
    pub fn add_setting(&mut self, setting: Setting) {
        // Remove existing setting with same key if present
        self.settings.retain(|s| s.key != setting.key);
        self.settings.push(setting);
    }
    
    pub fn get_setting(&self, key: &str) -> Option<&Setting> {
        self.settings.iter().find(|setting| setting.key == key)
    }
    
    pub fn get_setting_value(&self, key: &str) -> Option<&String> {
        self.get_setting(key).map(|setting| &setting.value)
    }
    
    pub fn get_all_settings(&self) -> &Vec<Setting> {
        &self.settings
    }
    
    pub fn remove_setting(&mut self, key: &str) -> Option<Setting> {
        if let Some(pos) = self.settings.iter().position(|s| s.key == key) {
            Some(self.settings.remove(pos))
        } else {
            None
        }
    }
}
