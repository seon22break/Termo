use crate::security::domain::{CipherService, PassphraseRepository, Passphrase, EncryptedData};
use crate::security::infrastructure::{AesGcmCipherService, InMemoryPassphraseRepository};
use crate::settings::domain::SettingsRepository;
use crate::settings::infrastructure::InSqliteSettingsRepository;
use crate::connection::infrastructure::InSqliteConnectionRepository;
use crate::connection::domain::Connection;
use base64::Engine;

#[tauri::command]
pub fn validate_passphrase_cmd(passphrase: String) -> Result<bool, String> {
    let settings_repo = InSqliteSettingsRepository;
    let value = settings_repo.read_setting("pwd_to_decrypt")
        .map_err(|e| format!("Error reading settings: {}", e))?;
    
    let value = match value {
        Some(v) => v,
        None => return Ok(false),
    };
    
    let parts: Vec<&str> = value.split(':').collect();
    if parts.len() != 2 {
        return Ok(false);
    }
    
    let ciphertext = match base64::engine::general_purpose::STANDARD.decode(parts[0]) {
        Ok(c) => c,
        Err(_) => return Ok(false),
    };
    
    let nonce_bytes: [u8; 12] = match base64::engine::general_purpose::STANDARD.decode(parts[1])
        .ok().and_then(|v| v.try_into().ok()) {
        Some(n) => n,
        None => return Ok(false),
    };
    
    let passphrase_obj = Passphrase::new(passphrase)?;
    let encrypted_data = EncryptedData::new(ciphertext, nonce_bytes);
    
    let cipher_service = AesGcmCipherService::new();
    match cipher_service.decrypt_with_passphrase(&passphrase_obj, &encrypted_data) {
        Ok(_) => {
            let passphrase_repo = InMemoryPassphraseRepository;
            passphrase_repo.save_passphrase(passphrase_obj);
            Ok(true)
        },
        Err(_) => Ok(false),
    }
}

#[tauri::command]
pub fn store_passphrase_cmd(passphrase: String) -> Result<(), String> {
    if passphrase.is_empty() {
        return Err("Password cannot be empty".to_string());
    }

    let passphrase_obj = Passphrase::new(passphrase.clone())?;
    let passphrase_repo = InMemoryPassphraseRepository;
    passphrase_repo.save_passphrase(passphrase_obj);

    let cipher_service = AesGcmCipherService::new();
    let encrypted_data = cipher_service.encrypt("test1234")?;
    
    let value = format!(
        "{}:{}",
        base64::engine::general_purpose::STANDARD.encode(&encrypted_data.ciphertext),
        base64::engine::general_purpose::STANDARD.encode(&encrypted_data.nonce)
    );

    let settings_repo = InSqliteSettingsRepository;
    settings_repo.write_setting("pwd_to_decrypt", &value)
        .map_err(|e| format!("Error saving in settings: {}", e))?;

    // Verify passphrase was saved correctly
    if let Some(saved_passphrase) = passphrase_repo.get_passphrase() {
        if saved_passphrase.as_str() != passphrase {
            return Err("Error occurred while saving password".to_string());
        }
    }
    
    Ok(())
}

#[tauri::command]
pub fn has_passphrase_in_memory_cmd() -> Result<bool, String> {
    println!("Checking if passphrase is in memory");
    
    let passphrase_repo = InMemoryPassphraseRepository;
    Ok(passphrase_repo.has_passphrase())
}

#[tauri::command]
pub fn has_password_connections_cmd() -> Result<bool, String> {
    println!("Checking if there are password connections");
    
    let connection_repo = InSqliteConnectionRepository;
    connection_repo.has_password_connections()
}

#[tauri::command]
pub fn get_first_password_connection_cmd() -> Result<Option<Connection>, String> {
    println!("Getting first password connection");
    
    let connection_repo = InSqliteConnectionRepository;
    connection_repo.get_first_password_connection()
}

#[tauri::command]
pub fn clear_passphrase_cmd() -> Result<(), String> {
    let passphrase_repo = InMemoryPassphraseRepository;
    passphrase_repo.clear_passphrase();
    Ok(())
}
