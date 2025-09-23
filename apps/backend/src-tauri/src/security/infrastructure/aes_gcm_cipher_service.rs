use crate::security::domain::{CipherService, EncryptedData, Passphrase, PassphraseRepository};
use crate::security::infrastructure::InMemoryPassphraseRepository;
use aes_gcm::{Aes256Gcm, KeyInit, Nonce, aead::{Aead, OsRng, rand_core::RngCore}};
use pbkdf2::pbkdf2_hmac;
use sha2::Sha256;

pub struct AesGcmCipherService {
    passphrase_repo: InMemoryPassphraseRepository,
}

impl AesGcmCipherService {
    pub fn new() -> Self {
        Self {
            passphrase_repo: InMemoryPassphraseRepository,
        }
    }
    
    fn derive_cipher_from_passphrase(&self, passphrase: &Passphrase) -> Result<Aes256Gcm, String> {
        let salt = &passphrase.as_bytes()[2..5]; // 3rd, 4th and 5th character
        let mut key = [0u8; 32];
        pbkdf2_hmac::<Sha256>(passphrase.as_bytes(), salt, 100_000, &mut key);
        Ok(Aes256Gcm::new(&key.into()))
    }
    
    fn derive_cipher(&self) -> Result<Aes256Gcm, String> {
        let passphrase = self.passphrase_repo.get_passphrase()
            .ok_or("No passphrase in memory")?;
        self.derive_cipher_from_passphrase(&passphrase)
    }
}

impl CipherService for AesGcmCipherService {
    fn encrypt(&self, password: &str) -> Result<EncryptedData, String> {
        let cipher = self.derive_cipher()?;
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);
        let ciphertext = cipher.encrypt(nonce, password.as_bytes())
            .map_err(|_| "Encryption error")?;
        Ok(EncryptedData::new(ciphertext, nonce_bytes))
    }

    fn decrypt(&self, encrypted_data: &EncryptedData) -> Result<String, String> {
        let cipher = self.derive_cipher()?;
        let nonce = Nonce::from_slice(&encrypted_data.nonce);
        let plaintext = cipher.decrypt(nonce, encrypted_data.ciphertext.as_ref())
            .map_err(|_| "Decryption error")?;
        String::from_utf8(plaintext).map_err(|_| "UTF-8 decryption error".to_string())
    }

    fn decrypt_with_passphrase(&self, passphrase: &Passphrase, encrypted_data: &EncryptedData) -> Result<String, String> {
        let cipher = self.derive_cipher_from_passphrase(passphrase)?;
        let nonce = Nonce::from_slice(&encrypted_data.nonce);
        let plaintext = cipher.decrypt(nonce, encrypted_data.ciphertext.as_ref())
            .map_err(|_| "Decryption error")?;
        String::from_utf8(plaintext).map_err(|_| "UTF-8 decryption error".to_string())
    }
}
