use crate::client::domain::{Client, ClientType};
use crate::client::infrastructure::SystemDetector;
use crate::connection::infrastructure::{ConnectionRepository, InSqliteConnectionRepository};
use crate::connection::application::find_all_connection_decrypted;
use crate::folder::infrastructure::InSqliteFolderRepository;
use crate::folder::domain::FolderRepository;
use crate::settings::infrastructure::InSqliteSettingsRepository;
use crate::settings::domain::SettingsRepository;

#[tauri::command]
pub fn get_client_cmd() -> Result<Client, String> {
    println!("🔍 Starting get_client_cmd execution");
    
    // Detect system type
    let client_type = match std::panic::catch_unwind(|| SystemDetector::detect_system()) {
        Ok(ct) => {
            println!("✅ System detected: {:?}", ct);
            ct
        },
        Err(e) => {
            println!("❌ Error detecting system: {:?}", e);
            return Err("Error detecting system type".to_string());
        }
    };
    
    let operating_system = get_operating_system_details(&client_type);
    println!("📋 OS details: {}", operating_system);
    
    // Initialize repositories
    println!("🏗️  Initializing repositories...");
    let connection_repository = InSqliteConnectionRepository;
    let folder_repository = InSqliteFolderRepository;
    let settings_repository = InSqliteSettingsRepository;
    
    // Get all connections (with decrypted passwords if possible)
    println!("🔗 Loading connections...");
    let connections = match find_all_connection_decrypted() {
        Ok(conns) => {
            println!("✅ Loaded {} decrypted connections", conns.len());
            conns
        },
        Err(e) => {
            println!("⚠️  Error getting decrypted connections, falling back to encrypted: {}", e);
            // Fallback to encrypted connections if decryption fails
            match connection_repository.get_all() {
                Ok(conns) => {
                    println!("✅ Loaded {} encrypted connections", conns.len());
                    conns
                },
                Err(e) => {
                    println!("❌ Error getting connections: {:?}", e);
                    return Err(format!("Error getting connections: {:?}", e));
                }
            }
        }
    };

    // Get all folders
    println!("📁 Loading folders...");
    let folders = match folder_repository.get_folders() {
        Ok(folders) => {
            println!("✅ Loaded {} folders", folders.len());
            folders
        },
        Err(e) => {
            println!("❌ Error getting folders: {}", e);
            return Err(format!("Error getting folders: {}", e));
        }
    };    // Get all settings (or client-specific settings)
    println!("⚙️  Loading settings...");
    let client_prefix = format!("client_{}_", client_type.as_str().to_lowercase());
    println!("🔍 Client prefix: {}", client_prefix);
    
    let client_settings = match settings_repository.get_settings_by_prefix(&client_prefix) {
        Ok(settings) => {
            println!("✅ Loaded {} client-specific settings", settings.len());
            settings
        },
        Err(e) => {
            println!("❌ Error getting client settings: {}", e);
            return Err(format!("Error getting client settings: {}", e));
        }
    };

    // Get global settings as well
    let global_settings = match settings_repository.get_all_settings() {
        Ok(settings) => {
            println!("✅ Loaded {} global settings", settings.len());
            settings
        },
        Err(e) => {
            println!("❌ Error getting all settings: {}", e);
            return Err(format!("Error getting all settings: {}", e));
        }
    };    // Combine client settings with global ones, giving priority to client-specific
    println!("🔀 Combining settings...");
    let mut all_settings = client_settings;
    for global_setting in global_settings {
        let is_client_specific = global_setting.key.starts_with("client_");
        if !is_client_specific {
            // Only add global settings that don't override client-specific ones
            let key_exists = all_settings.iter().any(|s| {
                s.key == global_setting.key || 
                s.key == format!("{}{}", client_prefix, global_setting.key.as_str())
            });
            if !key_exists {
                all_settings.push(global_setting);
            }
        }
    }
    println!("✅ Combined settings: {}", all_settings.len());

    // Create the complete client object
    println!("🏗️  Creating client object...");
    let client = match std::panic::catch_unwind(|| {
        Client::with_data(
            client_type.clone(),
            operating_system.clone(),
            connections.clone(),
            folders.clone(),
            all_settings.clone(),
        )
    }) {
        Ok(client) => {
            println!("✅ Client created successfully");
            client
        },
        Err(e) => {
            println!("❌ Error creating client: {:?}", e);
            return Err("Error creating client object".to_string());
        }
    };

    println!("🎉 Successfully created client with {} connections, {} folders, and {} settings", 
             client.connections.len(), client.folders.len(), client.settings.len());

    Ok(client)
}

#[tauri::command]
pub fn detect_system_cmd() -> Result<String, String> {
    println!("Detecting system type");
    
    let client_type = SystemDetector::detect_system();
    let system_name = client_type.as_str().to_string();
    
    println!("Detected system: {}", system_name);
    Ok(system_name)
}

// Helper function to get detailed OS information
fn get_operating_system_details(client_type: &ClientType) -> String {
    match client_type {
        ClientType::Windows => {
            // Could be enhanced to get Windows version details
            "Windows".to_string()
        }
        ClientType::Linux => {
            // Could be enhanced to get Linux distribution details
            "Linux".to_string()
        }
        ClientType::Mac => {
            // Could be enhanced to get macOS version details
            "macOS".to_string()
        }
    }
}
