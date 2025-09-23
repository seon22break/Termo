use crate::client::domain::ClientType;

pub struct SystemDetector;

impl SystemDetector {
    pub fn detect_system() -> ClientType {
        #[cfg(target_os = "windows")]
        {
            ClientType::Windows
        }
        
        #[cfg(target_os = "linux")]
        {
            ClientType::Linux
        }
        
        #[cfg(target_os = "macos")]
        {
            ClientType::Mac
        }
        
        #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
        {
            // Default fallback for unknown systems
            ClientType::Linux
        }
    }
}
