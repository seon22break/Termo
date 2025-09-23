#[derive(Debug, Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum ClientType {
    Windows,
    Linux,
    Mac,
}

impl ClientType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ClientType::Windows => "Windows",
            ClientType::Linux => "Linux", 
            ClientType::Mac => "Mac",
        }
    }
    
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "windows" => Some(ClientType::Windows),
            "linux" => Some(ClientType::Linux),
            "mac" | "macos" => Some(ClientType::Mac),
            _ => None,
        }
    }
}
