import React, { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { Connection } from "../../core/Connection/domain/Connection";

interface TerminalProps {
  connection: Connection;
  onClose?: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ connection, onClose }) => {
  const xtermRef = useRef<HTMLDivElement>(null);
  const term = useRef<XTerm | null>(null);
  const fitAddon = useRef(new FitAddon());
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const el = xtermRef.current;
    if (!el) return;

    term.current = new XTerm({
      fontSize: 14,
      theme: { 
        background: 'transparent',
        foreground: '#fafafa' 
      },
      cursorBlink: true,
      convertEol: true,
      scrollback: 1000,
      allowTransparency: true,
      cursorStyle: 'block',
      cursorWidth: 1,
      tabStopWidth: 8,
      disableStdin: false,
      allowProposedApi: true,
    });
    
    term.current.loadAddon(fitAddon.current);
    term.current.open(el);
    fitAddon.current.fit();
    term.current.focus();

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionIdRef.current = sessionId;

    const resizeObserver = new ResizeObserver(() => fitAddon.current.fit());
    resizeObserver.observe(el);

    let unlistenData: (() => void) | undefined;
    let unlistenReady: (() => void) | undefined;
    let isFirstConnection = true;
    let lastReceivedData = "";
    
    const setupEventListeners = async () => {
      unlistenData = await listen(`native-terminal-data:${sessionId}`, (event) => {
        console.log("Evento recibido:", event.payload);
        if (term.current && typeof event.payload === 'string') {
          const data = event.payload;
          
          if (data === lastReceivedData && data.trim().length > 10) {
            console.log("Duplicate data detected, ignoring:", data);
            return;
          }
          lastReceivedData = data;
          
          if (data.includes('Using username') || 
              data.includes('Authenticating with') ||
              data.includes('Access granted') ||
              data.includes('Opened channel for session')) {
            console.log("Mensaje técnico filtrado:", data);
            return;
          }
          if (isFirstConnection) {
            const hasServerContent = data.includes('Last login') || 
                                   data.includes('Welcome') || 
                                   /[$#%~]\s*$/.test(data.trim()) ||
                                   data.includes('@');
            
            if (hasServerContent) {
              console.log("First server content detected, clearing terminal");
              term.current.clear();
              isFirstConnection = false;
            }
          }
          
          term.current.write(data);
        }
      });
      
      unlistenReady = await listen(`native-terminal-ready:${sessionId}`, () => {
        console.log("Terminal SSH listo");
      });
    };

    const initializeTerminal = async () => {
      try {
        const authMethod = connection.sshkey ? "clave privada" : "contraseña";
        term.current?.writeln(`Conectando a ${connection.user}@${connection.host}:${connection.port || 22} usando ${authMethod}...`);
        
        await setupEventListeners();
        
        const connectionParams = {
          sid: sessionId,
          host: connection.host,
          port: connection.port || 22,
          user: connection.user,
          password: connection.sshkey ? undefined : (connection.password || undefined),
          private_key_path: connection.sshkey || undefined
        };
        
        console.log("Connecting with parameters:", {
          ...connectionParams,
          password: connectionParams.password ? "***" : undefined,
          private_key_path: connectionParams.private_key_path ? "***" : undefined
        });
        
        await invoke("open_native_terminal_cmd", connectionParams);
        console.log("SSH session started with ID:", sessionId);
      } catch (err) {
        console.error("Error starting SSH session:", err);
        term.current?.writeln(`Error starting SSH session: ${err}`);
        if (onClose) onClose();
      }
    };

    initializeTerminal();

    term.current.onData((data) => {
      console.log("Sending data:", JSON.stringify(data));
      
      invoke("send_native_terminal_data_cmd", { sid: sessionId, data: data }).catch((err) => {
        console.error("Error sending data:", err);
      });
    });

    // Foco al hacer click
    el.addEventListener('click', () => term.current?.focus());
    setTimeout(() => term.current?.focus(), 100);

    // Copy: Ctrl+Shift+C (Linux/Windows) or Cmd+C (macOS)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCopy =
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') ||
        (e.metaKey && e.key.toLowerCase() === 'c');
      const isPaste =
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v') ||
        (e.metaKey && e.key.toLowerCase() === 'v');

      if (isCopy) {
        const selection = term.current?.getSelection();
        if (selection) {
          e.preventDefault();
          navigator.clipboard.writeText(selection).catch(console.error);
        }
      } else if (isPaste) {
        e.preventDefault();
        navigator.clipboard.readText().then((text) => {
          if (text && term.current) {
            term.current.paste(text);
          }
        }).catch(console.error);
      }
    };

    // Paste via DOM paste event (right-click paste, Ctrl+V in WebView)
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text');
      if (text && term.current) {
        term.current.paste(text);
      }
    };

    el.addEventListener('keydown', handleKeyDown);
    el.addEventListener('paste', handlePaste);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('keydown', handleKeyDown);
      el.removeEventListener('paste', handlePaste);
      if (unlistenData) unlistenData();
      if (unlistenReady) unlistenReady();
      term.current?.dispose();
      if (sessionIdRef.current) {
        invoke("close_native_terminal_cmd", { sid: sessionIdRef.current }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  return (
    <div className="w-full h-full bg-transparent flex flex-col">
      <div ref={xtermRef} className="flex-1 h-full w-full" style={{ minHeight: 300 }} />
      {onClose && (
        <button onClick={onClose} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">
          Cerrar terminal
        </button>
      )}
    </div>
  );
};

export default Terminal;
