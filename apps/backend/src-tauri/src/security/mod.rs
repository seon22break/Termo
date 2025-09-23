pub mod domain;
pub mod application;
pub mod infrastructure;

pub use domain::{Passphrase, EncryptedData, CipherService, PassphraseRepository};
pub use infrastructure::{InMemoryPassphraseRepository, AesGcmCipherService};
pub use application::{
    validate_passphrase_cmd,
    store_passphrase_cmd,
    has_passphrase_in_memory_cmd,
    has_password_connections_cmd,
    get_first_password_connection_cmd,
    clear_passphrase_cmd,
};
