use std::{
  collections::HashMap,
  io::{Read, Write},
  path::Path,
  process::{Child, Command, Stdio},
  sync::{Arc, Mutex},
  thread,
  time::Duration,
};
use once_cell::sync::Lazy;
use tauri::{path::BaseDirectory, AppHandle, Emitter, Manager};

#[cfg(windows)]
use std::os::windows::process::CommandExt;

struct PuttySession {
  child: Child,
  stdin: Option<std::process::ChildStdin>,
  /// buffer for `get_terminal_output_cmd`
  buffer: Arc<Mutex<Vec<u8>>>,
}

static SESSIONS: Lazy<Arc<Mutex<HashMap<String, PuttySession>>>> =
  Lazy::new(|| Arc::new(Mutex::new(HashMap::new())));

// Helper function to find plink.exe
fn find_plink_executable(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    // Try different locations in order of preference
    let locations = vec![
        // First: try app local data directory (installation directory)
        ("plink.exe", BaseDirectory::AppLocalData),
        ("bin/plink.exe", BaseDirectory::AppLocalData),
        // Resource directory (bundled app)
        ("bin/plink.exe", BaseDirectory::Resource),
        ("plink.exe", BaseDirectory::Resource),
        // App data directory
        ("bin/plink.exe", BaseDirectory::AppData),
        ("plink.exe", BaseDirectory::AppData),
    ];
    
    for (path_str, base_dir) in locations {
        if let Ok(path) = app.path().resolve(path_str, base_dir) {
            println!("Checking plink.exe at: {:?}", path);
            if path.exists() {
                println!("Found plink.exe at: {:?}", path);
                return Ok(path);
            }
        }
    }
    
    // Final fallback: try relative to current working directory
    let fallbacks = vec![
        Path::new("plink.exe"),
        Path::new("bin/plink.exe"),
    ];
    
    for fallback_path in fallbacks {
        if fallback_path.exists() {
            println!("Found plink.exe in current working directory: {:?}", fallback_path);
            return Ok(fallback_path.to_path_buf());
        }
    }
    
    Err("plink.exe not found in any expected location. Make sure it's bundled with the application.".to_string())
}

// ============== PUTTY COMMANDS ==============

#[tauri::command]
pub async fn open_native_terminal_cmd(
    app: AppHandle, 
    sid: String,
    host: String,
    port: u16,
    user: String,
    password: Option<String>,
    private_key_path: Option<String>
) -> Result<(), String> {
    // Close existing session if it already exists
    if let Some(mut existing_session) = SESSIONS.lock().unwrap().remove(&sid) {
        println!("Closing existing session {}", sid);
        let _ = existing_session.child.kill();
        let _ = existing_session.child.wait();
    }

    println!("Starting SSH connection to {}@{}:{}", user, host, port);
    
    let plink_path = find_plink_executable(&app)?;

    let user_host = format!("{}@{}", user, host);
    let mut args: Vec<String> = vec![
        "-ssh".to_string(),
        user_host,
        "-P".to_string(),
        port.to_string(),
        "-batch".to_string(),
        "-no-antispoof".to_string(),
    ];

    // Configure authentication
    if let Some(key_path) = private_key_path {
        println!("Using private key authentication: {}", key_path);
        args.push("-i".to_string());
        args.push(key_path);
    } else if let Some(pass) = password {
        println!("Using password authentication");
        args.push("-pw".to_string());
        args.push(pass);
    } else {
        return Err("Password or private key required for authentication".to_string());
    }

    args.push("-t".to_string()); // Force pseudo-terminal allocation for interactive session

    println!("Starting SSH connection with plink...");
    
    let mut command = Command::new(plink_path);
    command
        .args(&args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(windows)]
    {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        command.creation_flags(CREATE_NO_WINDOW);
    }

    let mut child = command
        .spawn()
        .map_err(|e| format!("Error executing plink.exe: {e}"))?;

    println!("plink.exe process started with PID: {:?}", child.id());
    println!("Arguments used: {:?}", args);

    let stdin = child.stdin.take();
    let stdout = child.stdout.take().ok_or("Could not capture stdout")?;
    let stderr = child.stderr.take().ok_or("Could not capture stderr")?;

    let buffer = Arc::new(Mutex::new(Vec::<u8>::new()));

    let buf_out = Arc::clone(&buffer);
    let buf_err = Arc::clone(&buffer);

    let app_out = app.clone();
    let app_err = app.clone();
    let sid_out = sid.clone();
    let sid_err = sid.clone();

    thread::spawn(move || {
        let mut reader = std::io::BufReader::new(stdout);
        let mut tmp = [0u8; 4096];
        println!("stdout thread started");
        loop {
            match reader.read(&mut tmp) {
                Ok(0) => {
                    println!("stdout EOF reached");
                    break;
                },
                Ok(n) => {
                    println!("stdout read {} bytes", n);
                    {
                        let mut buf = buf_out.lock().unwrap();
                        buf.extend_from_slice(&tmp[..n]);
                    }
                    
                    let payload = String::from_utf8_lossy(&tmp[..n]).to_string();
                    println!("Emitting stdout: {:?}", &payload[..std::cmp::min(payload.len(), 50)]);
                    let _ = app_out.emit(&format!("native-terminal-data:{sid_out}"), payload);
                }
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                    thread::sleep(Duration::from_millis(10));
                },
                Err(e) => {
                    println!("Error reading stdout: {}", e);
                    thread::sleep(Duration::from_millis(50));
                },
            }
        }
        println!("stdout thread ended");
    });

    thread::spawn(move || {
        let mut reader = std::io::BufReader::new(stderr);
        let mut tmp = [0u8; 4096];
        println!("stderr thread started");
        loop {
            match reader.read(&mut tmp) {
                Ok(0) => {
                    println!("stderr EOF reached");
                    break;
                },
                Ok(n) => {
                    println!("stderr read {} bytes", n);
                    let payload = String::from_utf8_lossy(&tmp[..n]).to_string();
                    println!("stderr received: {:?}", &payload[..std::cmp::min(payload.len(), 50)]);
                    
                    if payload.contains("Error") || payload.contains("Failed") || payload.contains("Permission denied") {
                        let _ = app_err.emit(&format!("native-terminal-data:{sid_err}"), payload.clone());
                    }
                    
                    {
                        let mut buf = buf_err.lock().unwrap();
                        buf.extend_from_slice(&tmp[..n]);
                    }
                }
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                    thread::sleep(Duration::from_millis(10));
                },
                Err(e) => {
                    println!("Error reading stderr: {}", e);
                    thread::sleep(Duration::from_millis(50));
                },
            }
        }
        println!("stderr thread ended");
    });

    SESSIONS.lock().unwrap().insert(
        sid.clone(),
        PuttySession {
            child,
            stdin,
            buffer: buffer,
        },
    );

    println!("Session {} saved successfully", sid);

    let _ = app.emit(&format!("native-terminal-ready:{sid}"), "ready");

    Ok(())
}

#[tauri::command]
pub async fn send_native_terminal_data_cmd(sid: String, data: String) -> Result<(), String> {
  println!("Sending data to terminal {}: {:?}", sid, data);
  
  if let Some(session) = SESSIONS.lock().unwrap().get_mut(&sid) {
    if let Some(stdin) = session.stdin.as_mut() {
      stdin
        .write_all(data.as_bytes())
        .map_err(|e| format!("Error writing to stdin: {e}"))?;
      stdin.flush().map_err(|e| format!("Error flushing stdin: {e}"))?;
      println!("Data sent successfully");
    } else {
      return Err("stdin not available".into());
    }
    Ok(())
  } else {
    Err("Session not found".into())
  }
}

#[tauri::command]
pub async fn get_terminal_output_cmd(sid: String) -> Result<String, String> {
    if let Some(session) = SESSIONS.lock().unwrap().get(&sid) {
        let mut bytes = session.buffer.lock().unwrap();
        
        if bytes.is_empty() {
            return Ok(String::new());
        }
        
        let output = String::from_utf8_lossy(&bytes).to_string();
        println!("Fallback buffer contained {} bytes: {:?}", bytes.len(), &output[..std::cmp::min(output.len(), 50)]);
        
        bytes.clear();
        
        Ok(output)
    } else {
        Err("Session not found".into())
    }
}

#[tauri::command]
pub async fn close_native_terminal_cmd(sid: String) -> Result<(), String> {
  if let Some(mut session) = SESSIONS.lock().unwrap().remove(&sid) {
    if let Some(stdin) = session.stdin.as_mut() {
      let _ = stdin.write_all(b"exit\r\n");
      let _ = stdin.flush();
    }
    thread::sleep(Duration::from_millis(150));
    let _ = session.child.kill();
    let _ = session.child.wait();
    Ok(())
  } else {
    Err("Session not found".into())
  }
}
