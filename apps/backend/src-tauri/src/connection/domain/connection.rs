use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Connection {
    pub id: String,
    pub host: String,
    pub port: u16,
    pub display_name: String,
    pub user: String,
    pub password: String,
    pub sshkey: String,
    pub icon: String,
    pub folder_id: String,
}
