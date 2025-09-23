pub mod domain;
pub mod application;
pub mod infrastructure;

pub use domain::{Client, ClientType};
pub use infrastructure::SystemDetector;
pub use application::{
    get_client_cmd,
    detect_system_cmd,
};
