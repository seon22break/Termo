#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: String,
}

impl Setting {
    pub fn new(key: String, value: String) -> Self {
        Self { key, value }
    }
}
