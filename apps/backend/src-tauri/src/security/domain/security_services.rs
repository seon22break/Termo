use super::models::{Passphrase, EncryptedData};

pub trait CipherService {
    fn encrypt(&self, password: &str) -> Result<EncryptedData, String>;
    fn decrypt(&self, encrypted_data: &EncryptedData) -> Result<String, String>;
    fn decrypt_with_passphrase(&self, passphrase: &Passphrase, encrypted_data: &EncryptedData) -> Result<String, String>;
}

pub trait PassphraseRepository {
    fn save_passphrase(&self, passphrase: Passphrase);
    fn get_passphrase(&self) -> Option<Passphrase>;
    fn clear_passphrase(&self);
    fn has_passphrase(&self) -> bool;
}
