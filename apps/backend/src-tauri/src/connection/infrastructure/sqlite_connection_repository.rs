use crate::connection::domain::Connection;
use crate::database::infrastructure::get_db;
use rusqlite::{params, Connection as SqliteConnection, Result};

pub trait ConnectionRepository {
    fn create(&self, conn: &Connection) -> Result<Connection, String>;
    fn get_all(&self) -> Result<Vec<Connection>>;
    fn get_by_id(&self, id: &str) -> Result<Option<Connection>>;
    fn get_by_folder_id(&self, folder_id: &str) -> Result<Vec<Connection>>;
    fn update(&self, conn: &Connection) -> Result<(), String>;
    fn delete(&self, id: &str) -> Result<(), String>;
}

pub struct InSqliteConnectionRepository;

impl InSqliteConnectionRepository {
    fn get_db() -> Result<SqliteConnection> {
        get_db()
    }

    pub fn has_password_connections(&self) -> Result<bool, String> {
        let conn = Self::get_db().map_err(|e| e.to_string())?;
        let mut stmt = conn.prepare(
            "SELECT COUNT(*) FROM connections WHERE (sshkey IS NULL OR sshkey = '') AND password != ''"
        ).map_err(|e| e.to_string())?;
        let count: i64 = stmt.query_row([], |row| row.get(0)).map_err(|e| e.to_string())?;
        Ok(count > 0)
    }

    pub fn get_first_password_connection(&self) -> Result<Option<Connection>, String> {
        let conn = Self::get_db().map_err(|e| e.to_string())?;
        let mut stmt = conn.prepare(
            "SELECT id, host, port, display_name, user, password, sshkey, icon, folder_id FROM connections WHERE (sshkey IS NULL OR sshkey = '') AND password != '' LIMIT 1"
        ).map_err(|e| e.to_string())?;
        let mut rows = stmt.query([]).map_err(|e| e.to_string())?;
        if let Some(row) = rows.next().map_err(|e| e.to_string())? {
            Ok(Some(Connection {
                id: row.get(0).map_err(|e| e.to_string())?,
                host: row.get(1).map_err(|e| e.to_string())?,
                port: row.get(2).map_err(|e| e.to_string())?,
                display_name: row.get(3).map_err(|e| e.to_string())?,
                user: row.get(4).map_err(|e| e.to_string())?,
                password: row.get(5).map_err(|e| e.to_string())?,
                sshkey: row.get(6).map_err(|e| e.to_string())?,
                icon: row.get(7).map_err(|e| e.to_string())?,
                folder_id: row.get(8).map_err(|e| e.to_string())?,
            }))
        } else {
            Ok(None)
        }
    }
}

impl ConnectionRepository for InSqliteConnectionRepository {
    fn create(&self, conn: &Connection) -> Result<Connection, String> {
        let db = Self::get_db().map_err(|e| e.to_string())?;
        db.execute(
            "INSERT INTO connections (id, host, port, display_name, user, password, sshkey, icon, folder_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                conn.id,
                conn.host,
                conn.port,
                conn.display_name,
                conn.user,
                conn.password,
                conn.sshkey,
                conn.icon,
                conn.folder_id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(conn.clone())
    }

    fn get_all(&self) -> Result<Vec<Connection>> {
        let conn = Self::get_db()?;
        let mut stmt = conn.prepare(
            "SELECT id, host, port, display_name, user, password, sshkey, icon, folder_id FROM connections"
        )?;
        let connections = stmt.query_map([], |row| {
            Ok(Connection {
                id: row.get(0)?,
                host: row.get(1)?,
                port: row.get(2)?,
                display_name: row.get(3)?,
                user: row.get(4)?,
                password: row.get(5)?,
                sshkey: row.get(6)?,
                icon: row.get(7)?,
                folder_id: row.get(8)?,
            })
        })?;
        Ok(connections.filter_map(Result::ok).collect())
    }

    fn get_by_id(&self, id: &str) -> Result<Option<Connection>> {
        let conn = Self::get_db()?;
        let mut stmt = conn.prepare("SELECT id, host, port, display_name, user, password, sshkey, icon, folder_id FROM connections WHERE id = ?1")?;
        let mut rows = stmt.query(params![id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Connection {
                id: row.get(0)?,
                host: row.get(1)?,
                port: row.get(2)?,
                display_name: row.get(3)?,
                user: row.get(4)?,
                password: row.get(5)?,
                sshkey: row.get(6)?,
                icon: row.get(7)?,
                folder_id: row.get(8)?
            }))
        } else {
            Ok(None)
        }
    }

    fn get_by_folder_id(&self, folder_id: &str) -> Result<Vec<Connection>> {
        let conn = Self::get_db()?;
        let mut stmt = conn.prepare(
            "SELECT id, host, port, display_name, user, password, sshkey, icon, folder_id FROM connections WHERE folder_id = ?1"
        )?;
        let connections = stmt.query_map(params![folder_id], |row| {
            Ok(Connection {
                id: row.get(0)?,
                host: row.get(1)?,
                port: row.get(2)?,
                display_name: row.get(3)?,
                user: row.get(4)?,
                password: row.get(5)?,
                sshkey: row.get(6)?,
                icon: row.get(7)?,
                folder_id: row.get(8)?,
            })
        })?;
        Ok(connections.filter_map(Result::ok).collect())
    }

    fn update(&self, conn: &Connection) -> Result<(), String> {
        let db = Self::get_db().map_err(|e| e.to_string())?;
        db.execute(
            "UPDATE connections SET host = ?1, port = ?2, display_name = ?3, user = ?4, password = ?5, sshkey = ?6, icon = ?7, folder_id = ?8 WHERE id = ?9",
            params![
                conn.host,
                conn.port,
                conn.display_name,
                conn.user,
                conn.password,
                conn.sshkey,
                conn.icon,
                conn.folder_id,
                conn.id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    fn delete(&self, id: &str) -> Result<(), String> {
        let db = Self::get_db().map_err(|e| e.to_string())?;
        db.execute("DELETE FROM connections WHERE id = ?1", params![id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
