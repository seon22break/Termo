use uuid::Uuid;
use crate::connection::infrastructure::{ConnectionRepository, InSqliteConnectionRepository};
use crate::connection::domain::Connection;
use crate::security::domain::{CipherService, PassphraseRepository};
use crate::security::infrastructure::{AesGcmCipherService, InMemoryPassphraseRepository};
use base64::{engine::general_purpose, Engine as _};
use std::net::{TcpStream, ToSocketAddrs};
use std::time::Duration;

#[tauri::command]
pub fn add_connection(
    host: String,
    port: u16,
    display_name: String,
    user: String,
    password: String,
    sshkey: String,
    icon: String,
    folder_id: String,
) -> Result<Connection, String> {
    let repo = InSqliteConnectionRepository;
    let valid_port = if (1..=u16::MAX).contains(&port) { port } else { return Err("Port is not valid".to_string()) };
    let id = Uuid::new_v4().to_string();

    let has_password = !password.is_empty();
    let has_sshkey = !sshkey.is_empty();

    if has_password && has_sshkey {
        return Err("Cannot have both password and sshkey at the same time".to_string());
    }

    let (final_password, final_sshkey) = if has_password {
        let passphrase_repo = InMemoryPassphraseRepository;
        if !passphrase_repo.has_passphrase() {
            return Err("No passphrase in memory for encryption".to_string());
        }
        let cipher_service = AesGcmCipherService::new();
        let encrypted_data = cipher_service.encrypt(&password).map_err(|e| e.to_string())?;
        let encrypted_b64 = general_purpose::STANDARD.encode(&encrypted_data.ciphertext);
        let nonce_b64 = general_purpose::STANDARD.encode(&encrypted_data.nonce);
        (encrypted_b64, nonce_b64)
    } else {
        (password, sshkey)
    };

    let connection = Connection {
        id,
        host,
        port: valid_port,
        display_name,
        user,
        password: final_password,
        sshkey: final_sshkey,
        icon,
        folder_id,
    };
    repo.create(&connection)
}

#[tauri::command]
pub fn delete_connection(id: String) -> Result<(), String> {
    let repo = InSqliteConnectionRepository;
    if id.is_empty() {
        return Err("ID cannot be empty".to_string());
    }
    match repo.get_by_id(&id) {
        Ok(Some(_)) => repo.delete(&id),
        Ok(None) => Err("No connection exists with that ID".to_string()),
        Err(e) => Err(format!("Error searching for connection: {}", e)),
    }
}

#[tauri::command]
pub fn find_all_connection() -> Result<Vec<Connection>, String> {
    let repo = InSqliteConnectionRepository;
    repo.get_all().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn find_one_connection(id: String) -> Result<Option<Connection>, String> {
    let repo = InSqliteConnectionRepository;
    if id.is_empty() {
        return Err("ID cannot be empty".to_string());
    }
    repo.get_by_id(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn test_connection(host: String, port: u16) -> Result<(), String> {
    let addr = format!("{}:{}", host, port);
    let timeout = Duration::from_secs(3);
    match addr.to_socket_addrs() {
        Ok(mut addrs) => {
            if let Some(socket_addr) = addrs.next() {
                match TcpStream::connect_timeout(&socket_addr, timeout) {
                    Ok(_) => Ok(()),
                    Err(e) => Err(format!("Could not connect: {}", e)),
                }
            } else {
                Err("Could not resolve address".to_string())
            }
        },
        Err(e) => Err(format!("Error resolving address: {}", e)),
    }
}

#[tauri::command]
pub fn update_connection(connection: Connection) -> Result<(), String> {
    let repo = InSqliteConnectionRepository;
    if connection.id.is_empty() {
        return Err("ID cannot be empty".to_string());
    }
    match repo.get_by_id(&connection.id) {
        Ok(Some(_)) => repo.update(&connection),
        Ok(None) => Err("No connection exists with that ID".to_string()),
        Err(e) => Err(format!("Error searching for connection: {}", e)),
    }
}

#[tauri::command]
// NOTE: This command is available but it's recommended to use get_client_cmd
// which already includes decrypted connections. Only use this command
// directly if specific access to decrypted connections is needed
// without the complete client context.
pub fn find_all_connection_decrypted() -> Result<Vec<Connection>, String> {
    let repo = InSqliteConnectionRepository;
    let connections = repo.get_all().map_err(|e| e.to_string())?;
    
    let passphrase_repo = InMemoryPassphraseRepository;
    if !passphrase_repo.has_passphrase() {
        return Err("No passphrase in memory for decryption".to_string());
    }
    
    let cipher_service = AesGcmCipherService::new();
    let mut decrypted_connections = Vec::new();
    
    for conn in connections {
        let mut decrypted_conn = conn.clone();
        
        // If the connection has an encrypted password (non-empty password and sshkey with nonce)
        if !conn.password.is_empty() && !conn.sshkey.is_empty() && conn.sshkey != "".to_string() {
            // Try to decrypt the password
            match (
                general_purpose::STANDARD.decode(&conn.password),
                general_purpose::STANDARD.decode(&conn.sshkey)
            ) {
                (Ok(ciphertext), Ok(nonce_bytes)) => {
                    if let Ok(nonce_array) = nonce_bytes.try_into() {
                        let encrypted_data = crate::security::domain::EncryptedData::new(ciphertext, nonce_array);
                        match cipher_service.decrypt(&encrypted_data) {
                            Ok(decrypted_password) => {
                                decrypted_conn.password = decrypted_password;
                                decrypted_conn.sshkey = "".to_string(); // Clear nonce after decrypting
                            },
                            Err(e) => {
                                println!("Error decrypting password for connection {}: {}", conn.id, e);
                                // Keep original values if decryption fails
                            }
                        }
                    }
                },
                _ => {
                    // If they can't be decoded, they're probably not encrypted
                    // Keep original values
                }
            }
        }
        
        decrypted_connections.push(decrypted_conn);
    }
    
    Ok(decrypted_connections)
}

#[tauri::command]
pub fn get_connections_by_folder(folder_id: String) -> Result<Vec<Connection>, String> {
    let repo = InSqliteConnectionRepository;
    repo.get_by_folder_id(&folder_id).map_err(|e| e.to_string())
}
