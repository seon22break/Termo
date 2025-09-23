use crate::security::domain::{PassphraseRepository, Passphrase};
use std::sync::Mutex;
use once_cell::sync::Lazy;

static PASSPHRASE_STORAGE: Lazy<Mutex<Option<Passphrase>>> = Lazy::new(|| Mutex::new(None));

pub struct InMemoryPassphraseRepository;

impl PassphraseRepository for InMemoryPassphraseRepository {
    fn save_passphrase(&self, passphrase: Passphrase) {
        let mut stored = PASSPHRASE_STORAGE.lock().unwrap();
        *stored = Some(passphrase);
    }

    fn get_passphrase(&self) -> Option<Passphrase> {
        let stored = PASSPHRASE_STORAGE.lock().unwrap();
        stored.clone()
    }

    fn clear_passphrase(&self) {
        let mut stored = PASSPHRASE_STORAGE.lock().unwrap();
        *stored = None;
    }

    fn has_passphrase(&self) -> bool {
        let stored = PASSPHRASE_STORAGE.lock().unwrap();
        stored.is_some()
    }
}
