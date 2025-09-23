pub mod connection;
pub mod command_line;
pub mod settings;
pub mod client;
pub mod security;
pub mod database;
pub mod folder;
use database::{check_or_create_db, delete_database_cmd, init_db_path};
use connection::application::commands::{
    add_connection,
    delete_connection,
    get_connections_by_folder,
    test_connection,
    update_connection
};
use security::{
    validate_passphrase_cmd,
    store_passphrase_cmd
};
use settings::{
    read_setting_cmd,
    write_setting_cmd,
};
use client::{
    get_client_cmd,
    detect_system_cmd,
};
use command_line::{
    open_native_terminal_cmd,
    send_native_terminal_data_cmd,
    close_native_terminal_cmd
};
use folder::{
    create_folder_cmd,
    get_folders_cmd,
    delete_folder_cmd,
    get_folder_by_id_cmd,
    update_folder_cmd,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize database path with app handle
            if let Err(e) = init_db_path(app.handle()) {
                eprintln!("Error initializing database path: {}", e);
            }
            
            // Initialize database
            if let Err(e) = check_or_create_db() {
                eprintln!("Error initializing database: {}", e);
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            add_connection,
            delete_connection,
            get_connections_by_folder,
            test_connection,
            validate_passphrase_cmd,
            store_passphrase_cmd, 
            write_setting_cmd,
            read_setting_cmd,
            open_native_terminal_cmd,
            send_native_terminal_data_cmd,
            close_native_terminal_cmd,
            get_client_cmd,
            detect_system_cmd,
            update_connection,
            delete_database_cmd,
            create_folder_cmd,
            get_folders_cmd,
            delete_folder_cmd,
            get_folder_by_id_cmd,
            update_folder_cmd
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
