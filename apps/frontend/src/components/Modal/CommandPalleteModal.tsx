import React, { useEffect, useRef, useState, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { useTabActions } from "../../hooks/useTabActions";
import { useI18n } from "../../context/I18nContext";
import { useFolder } from "../../hooks/useFolder";
import AddCircleIcon from "../../assets/Icons/add-circle-stroke-rounded";
import { TabType } from "../../types/PageSystem";
import { usePageSystem } from "../../hooks/usePageSystem";

// Define action interface
interface Action {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: () => void;
}

interface CommandPalleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalleteModal: React.FC<CommandPalleteModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const { conexiones, toggleSidebar, openFolderModal } = useApp();
  const { folders } = useFolder();
  const { openTerminalTab } = useTabActions();
  const { openTab } = usePageSystem();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof conexiones>([]);
  const [actionResults, setActionResults] = useState<Action[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const getFolderName = useCallback((folderId: string): string => {
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.folder_name : t.search.noFolder;
  }, [folders, t.search.noFolder]);

  const actions = useCallback((): Action[] => [
    {
      id: 'new-connection',
      name: t.search.newConnection,
      description: t.search.newConnectionDesc,
      icon: '🔗',
      action: () => {
        openTab(TabType.ADD_CONNECTION);
        onClose();
      }
    },
    {
      id: 'new-folder', 
      name: t.search.newFolder,
      description: t.search.newFolderDesc,
      icon: '📁',
      action: () => {
        openFolderModal();
        onClose();
      }
    },
    {
      id: 'open-settings',
      name: t.search.openSettings,
      description: t.search.openSettingsDesc,
      icon: '⚙️',
      action: () => {
        openTab(TabType.SETTINGS);
        onClose();
      }
    }
  ], [t, openTab, toggleSidebar, openFolderModal, onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setActionResults([]);
      setSelectedIdx(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 1) {
      const q = query.toLowerCase();
      
      // Filter connections
      const filteredConnections = conexiones.filter(
        (c) => 
          c.display_name.toLowerCase().includes(q) || 
          c.host?.toLowerCase().includes(q) ||
          c.user?.toLowerCase().includes(q) ||
          getFolderName(c.folder_id).toLowerCase().includes(q)
      );
      
      // Filter actions
      const filteredActions = actions().filter(
        (a) => 
          a.name.toLowerCase().includes(q) || 
          a.description.toLowerCase().includes(q)
      );
      
      setResults(filteredConnections);
      setActionResults(filteredActions);
      setSelectedIdx(0);
    } else {
      // Show all actions when no query (empty search)
      setResults([]);
      setActionResults(actions());
      setSelectedIdx(0);
    }
  }, [query, conexiones, folders, getFolderName, actions]);

  const handleSelect = (conn: typeof conexiones[number]) => {
    openTerminalTab(conn);
    onClose();
  };

  const handleActionSelect = (action: Action) => {
    action.action();
  };

  const getTotalResults = () => actionResults.length + results.length;

  const getSelectedItem = () => {
    if (selectedIdx < actionResults.length) {
      return { type: 'action', item: actionResults[selectedIdx] };
    } else {
      return { type: 'connection', item: results[selectedIdx - actionResults.length] };
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalResults = getTotalResults();
    
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((idx) => (totalResults ? Math.min(idx + 1, totalResults - 1) : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((idx) => (totalResults ? Math.max(idx - 1, 0) : 0));
    } else if (e.key === "Enter") {
      const selectedItem = getSelectedItem();
      if (selectedItem.type === 'action') {
        handleActionSelect(selectedItem.item as Action);
      } else if (selectedItem.type === 'connection') {
        handleSelect(selectedItem.item as typeof conexiones[number]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-zinc-700 rounded-lg shadow-lg w-full max-w-md p-2 mt-10 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="w-full text-base p-2 outline-none text-white bg-transparent"
          placeholder={t.search.searchConnections}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="mt-2 max-h-48 overflow-y-auto">
          {/* Action Results */}
          {actionResults.length > 0 && (
            <div className="space-y-1 mb-3">
              <div className="text-xs text-zinc-400 px-2 py-1">{t.search.actions}</div>
              {actionResults.map((action, idx) => (
                <div
                  key={action.id}
                  className={`p-2 rounded cursor-pointer text-zinc-300 flex items-center justify-between ${idx === selectedIdx ? "bg-zinc-600" : "hover:bg-zinc-600"}`}
                  onClick={() => handleActionSelect(action)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{action.icon}</span>
                    <div>
                      <div className="font-medium">{action.name}</div>
                      <div className="text-xs text-zinc-400">{action.description}</div>
                    </div>
                  </div>
                  {(idx === selectedIdx) && (
                    <span className="ml-2 flex items-center shrink-0">
                      <AddCircleIcon width={20} height={20} color="#60a5fa" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Connection Results */}
          {results.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-zinc-400 px-2 py-1">{t.search.connections}</div>
              {results.map((conn, idx) => {
                const adjustedIdx = actionResults.length + idx;
                return (
                  <div
                    key={conn.id}
                    className={`p-2 rounded cursor-pointer text-zinc-300 flex items-center justify-between ${adjustedIdx === selectedIdx ? "bg-zinc-600" : "hover:bg-zinc-600"}`}
                    onClick={() => handleSelect(conn)}
                    onMouseEnter={() => setSelectedIdx(adjustedIdx)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium truncate">{conn.display_name}</div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                          📁 {getFolderName(conn.folder_id)}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 truncate">{conn.user}@{conn.host}:{conn.port}</div>
                    </div>
                    {(adjustedIdx === selectedIdx) && (
                      <span className="ml-2 flex items-center shrink-0">
                        <AddCircleIcon width={20} height={20} color="#60a5fa" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {results.length === 0 && actionResults.length === 0 && query.length >= 1 && (
            <div className="text-zinc-400 text-center py-4">
              <div className="text-2xl mb-2">🔍</div>
              <div>{t.search.noConnectionsFound}</div>
              <div className="text-xs mt-1">{t.search.tryAnotherSearchTerm}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalleteModal;
