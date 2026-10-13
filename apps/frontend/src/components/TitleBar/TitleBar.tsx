import React from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import TerminalIcon from '../../assets/Icons/TerminalIcon';

const TitleBar: React.FC = () => {
  const handleMinimize = async () => {
    try {
      await getCurrentWindow().minimize();
    } catch (e) {
      console.error('Failed to minimize window:', e);
    }
  };

  const handleMaximize = async () => {
    try {
      await getCurrentWindow().toggleMaximize();
    } catch (e) {
      console.error('Failed to maximize window:', e);
    }
  };

  const handleClose = async () => {
    try {
      await getCurrentWindow().close();
    } catch (e) {
      console.error('Failed to close window:', e);
    }
  };

  return (
    <div
      className="flex items-center justify-between bg-[#111] select-none h-9 shrink-0 border-b border-[#222]"
      data-tauri-drag-region
    >
      {/* App identity - left side */}
      <div className="flex items-center gap-2 px-3 h-full" data-tauri-drag-region>
        <TerminalIcon width={14} height={14} color="#4ecdc4" />
        <span className="text-xs text-zinc-400 font-medium tracking-wide" data-tauri-drag-region>
          Termo
        </span>
      </div>

      {/* Window controls - right side */}
      <div className="flex items-center h-full">
        <button
          onClick={handleMinimize}
          className="w-11 h-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
          title="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          className="w-11 h-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
          title="Maximize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="9" height="9" />
          </svg>
        </button>

        <button
          onClick={handleClose}
          className="w-11 h-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-red-600 transition-colors"
          title="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="1" y1="1" x2="9" y2="9" />
            <line x1="9" y1="1" x2="1" y2="9" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
