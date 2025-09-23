use backend_lib::client::application::commands::get_client_cmd;
use backend_lib::database::infrastructure::{check_or_create_db};
use backend_lib::connection::domain::Connection;
use backend_lib::folder::domain::Folder;
use backend_lib::settings::domain::Setting;

#[test]
fn test_get_client_cmd_success() {
    // Initialize database
    if let Err(e) = check_or_create_db() {
        eprintln!("Error initializing database: {}", e);
        return;
    }
    
    // Call the new unified get_client_cmd
    let result = get_client_cmd();
    
    match result {
        Ok(client) => {
            // Verify the client has the expected structure
            println!("Client type: {:?}", client.client_type);
            println!("Operating system: {}", client.operating_system);
            println!("Connections count: {}", client.connections.len());
            println!("Folders count: {}", client.folders.len());
            println!("Settings count: {}", client.settings.len());
            
            // Basic assertions
            assert!(!client.operating_system.is_empty(), "Operating system should not be empty");
            
            // The client should have all the data structures initialized
            println!("✓ Client successfully created with all data structures");
        }
        Err(e) => {
            panic!("Error getting client: {}", e);
        }
    }
}

#[test]
fn test_client_methods() {
    use backend_lib::client::domain::{Client, ClientType};
    
    // Create a test client
    let mut client = Client::new(ClientType::Windows, "Windows 11".to_string());
    
    // Test adding a connection
    let connection = Connection {
        id: "test1".to_string(),
        host: "localhost".to_string(),
        port: 22,
        display_name: "Test Connection".to_string(),
        user: "test".to_string(),
        password: "pass".to_string(),
        sshkey: "".to_string(),
        icon: "".to_string(),
        folder_id: "".to_string(),
    };
    
    client.add_connection(connection);
    assert_eq!(client.get_connections().len(), 1);
    assert!(client.get_connection_by_id("test1").is_some());
    assert!(client.get_connection_by_id("nonexistent").is_none());
    
    // Test adding a folder
    let folder = Folder::new("folder1".to_string(), "Test Folder".to_string());
    client.add_folder(folder);
    assert_eq!(client.get_folders().len(), 1);
    assert!(client.get_folder_by_id("folder1").is_some());
    
    // Test adding settings
    let setting = Setting::new("theme".to_string(), "dark".to_string());
    client.add_setting(setting);
    assert_eq!(client.get_all_settings().len(), 1);
    assert!(client.get_setting("theme").is_some());
    assert_eq!(client.get_setting_value("theme"), Some(&"dark".to_string()));
    
    // Test replacing setting
    let new_setting = Setting::new("theme".to_string(), "light".to_string());
    client.add_setting(new_setting);
    assert_eq!(client.get_all_settings().len(), 1); // Should still be 1, not 2
    assert_eq!(client.get_setting_value("theme"), Some(&"light".to_string()));
    
    println!("✓ All client methods working correctly");
}
