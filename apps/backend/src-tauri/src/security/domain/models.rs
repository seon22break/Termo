#[derive(Debug, Clone)]
pub struct Passphrase {
    pub value: String,
}

impl Passphrase {
    pub fn new(value: String) -> Result<Self, String> {
        if value.len() < 8 {
            return Err("Passphrase must be at least 8 characters long".to_string());
        }
        Ok(Self { value })
    }
    
    pub fn as_str(&self) -> &str {
        &self.value
    }
    
    pub fn as_bytes(&self) -> &[u8] {
        self.value.as_bytes()
    }
}

#[derive(Debug, Clone)]
pub struct EncryptedData {
    pub ciphertext: Vec<u8>,
    pub nonce: [u8; 12],
}

impl EncryptedData {
    pub fn new(ciphertext: Vec<u8>, nonce: [u8; 12]) -> Self {
        Self { ciphertext, nonce }
    }
}
