import React, { useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useI18n } from '../../context/I18nContext';
import { useFolder } from '../../hooks/useFolder';
import type { Connection } from "../../core/Connection/domain/Connection";
import type { Folder } from "../../core/Folder/domain/Folder";
import ContextMenuSidebar from "./ContextMenuSidebar";
import FolderContextMenu from "./FolderContextMenu";
import FolderModal from "../Modal/FolderModal";
import ConfirmToast from "../Toasts/ConfirmToast";
import TerminalIcon from "../../assets/Icons/TerminalIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import FolderOpenIcon from "../../assets/Icons/FolderOpenIcon";
import AlertToast from "../Toasts/AlertToast";
import Spinner from "../Loading/Spinner";

interface ItemSidebarWithFoldersProps {
  conexiones: Connection[];
  onDoubleClick: (connection: Connection) => void;
  onEdit?: (connection: Connection) => void;
  onConnectionDeleted?: () => void;
  isLoading?: boolean;
  loadingMessage?: string;
}

const ItemSidebarWithFolders: React.FC<ItemSidebarWithFoldersProps> = ({
  conexiones,
  onDoubleClick,
  onEdit,
  onConnectionDeleted,
  isLoading = false,
  loadingMessage
}) => {
  const { t } = useI18n();
  const { folders, deleteFolder } = useFolder();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Auto-expand all folders when they load
  React.useEffect(() => {
    if (folders.length > 0) {
      const allFolderIds = new Set(folders.map(folder => folder.id));
      setExpandedFolders(prev => {
        // Only update if there are new folders
        const prevSize = prev.size;
        const newSize = allFolderIds.size;
        if (prevSize !== newSize || !folders.every(folder => prev.has(folder.id))) {
          return allFolderIds;
        }
        return prev;
      });
    }
  }, [folders]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    connection: Connection | null;
    folder: Folder | null;
    type: 'connection' | 'folder';
  }>({
    show: false,
    x: 0,
    y: 0,
    connection: null,
    folder: null,
    type: 'connection'
  });

  // Modal states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [connectionToDelete, setConnectionToDelete] = useState<Connection | null>(null);

  // Alert states
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    loading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
    loading: false
  });

  const [isDeleting, setIsDeleting] = useState(false);

  // Group connections by folder
  const connectionsByFolder = useMemo(() => {
    const grouped = new Map<string, Connection[]>();

    // Initialize all folders with empty arrays
    folders.forEach(folder => {
      grouped.set(folder.id, []);
    });

    // Group connections by folder_id
    conexiones.forEach(connection => {
      const folderId = connection.folder_id || 'eec658fa-edd1-4fe9-b36e-a90ece79ce27'; // default folder
      const existingConnections = grouped.get(folderId) || [];
      grouped.set(folderId, [...existingConnections, connection]);
    });

    return grouped;
  }, [conexiones, folders]);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleConnectionContextMenu = (event: React.MouseEvent, connection: Connection) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      connection,
      folder: null,
      type: 'connection'
    });
    setHoveredItem(`connection-${connection.id}`);
  };

  const handleFolderContextMenu = (event: React.MouseEvent, folder: Folder) => {
    event.preventDefault();
    event.stopPropagation();
    // Don't allow context menu on default folder
    if (folder.id === 'eec658fa-edd1-4fe9-b36e-a90ece79ce27') return;

    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      connection: null,
      folder,
      type: 'folder'
    });
    setHoveredItem(`folder-${folder.id}`);
  };

  const handleConnectionEdit = () => {
    if (contextMenu.connection && onEdit) {
      onEdit(contextMenu.connection);
    }
    closeContextMenu();
  };

  const handleConnectionDelete = () => {
    if (contextMenu.connection) {
      setConnectionToDelete(contextMenu.connection);
      setShowConfirmDialog(true);
    }
    closeContextMenu();
  };

  const handleConnectionTest = async () => {
    if (!contextMenu.connection) return;
    const host = contextMenu.connection.host;
    const port = 22;
    setAlertState({
      isOpen: true,
      title: t.sidebar.testConnection,
      message: t.sidebar.testingConnection,
      type: 'info',
      loading: true
    });
    try {
      await invoke('test_connection', { host: host, port: port });
      setAlertState({
        isOpen: true,
        title: t.sidebar.connectionSuccessful,
        message: `${t.sidebar.connectionTo} ${host}:${port} ${t.sidebar.successful}`,
        type: 'success',
        loading: false
      });
    } catch (error) {
      console.error("Test connection error:", error);
      setAlertState({
        isOpen: true,
        title: t.sidebar.connectionError,
        message: `${t.sidebar.connectionTo} ${host}:${port} failed`,
        type: 'error',
        loading: false
      });
    }
    closeContextMenu();
  };

  const handleFolderEdit = () => {
    if (contextMenu.folder) {
      setEditingFolder(contextMenu.folder);
      setShowFolderModal(true);
    }
    closeContextMenu();
  };

  const handleFolderDelete = () => {
    if (contextMenu.folder) {
      // Check if folder has connections
      const folderConnections = connectionsByFolder.get(contextMenu.folder.id) || [];
      if (folderConnections.length > 0) {
        setAlertState({
          isOpen: true,
          title: "Cannot Delete Folder",
          message: `The folder "${contextMenu.folder.folder_name}" contains ${folderConnections.length} connection(s). Please move or delete all connections first.`,
          type: 'error',
          loading: false
        });
        closeContextMenu();
        return;
      }

      setFolderToDelete(contextMenu.folder);
      setShowConfirmDialog(true);
    }
    closeContextMenu();
  };

  const confirmConnectionDelete = async () => {
    if (!connectionToDelete) return;

    setIsDeleting(true);
    try {
      await invoke("delete_connection", {
        id: connectionToDelete.id
      });

      if (onConnectionDeleted) {
        onConnectionDeleted();
      }

    } catch (error) {
      console.error("Delete connection error:", error);
      alert(t.sidebar.deleteConnectionError);
    } finally {
      setIsDeleting(false);
    }

    setShowConfirmDialog(false);
    setConnectionToDelete(null);
  };

  const confirmFolderDelete = async () => {
    if (!folderToDelete) return;

    setIsDeleting(true);
    try {
      await deleteFolder(folderToDelete.id);
    } catch (error) {
      console.error("Delete folder error:", error);
      alert(t.folders.errorDeletingFolder);
    } finally {
      setIsDeleting(false);
    }

    setShowConfirmDialog(false);
    setFolderToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setConnectionToDelete(null);
    setFolderToDelete(null);
  };

  const closeContextMenu = () => {
    setContextMenu({
      show: false,
      x: 0,
      y: 0,
      connection: null,
      folder: null,
      type: 'connection'
    });
    setHoveredItem(null);
  };

  const handleCreateFolder = () => {
    setEditingFolder(null);
    setShowFolderModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" text={loadingMessage} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {/* Create New Folder Button */}
        <button
          onClick={handleCreateFolder}
          className="flex items-center rounded text-xs text-left py-2 px-4 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer w-full mb-2"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{t.sidebar.newFolder}</span>
        </button>

        {/* Render folders and their connections */}
        {Array.from(connectionsByFolder.entries()).map(([folderId, folderConnections]) => {
          const folder = folders.find(f => f.id === folderId);
          if (!folder) return null;

          const isExpanded = expandedFolders.has(folderId);
          const isHovered = hoveredItem === `folder-${folderId}`;
          const isDefaultFolder = folder.id === 'eec658fa-edd1-4fe9-b36e-a90ece79ce27';

          return (
            <div key={folderId}>
              {/* Folder Header */}
              <button
                className={`flex items-center rounded text-xs text-left py-2 px-3 font-medium transition cursor-pointer w-full ${isHovered && contextMenu.show
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                onClick={() => toggleFolder(folderId)}
                onContextMenu={(e) => handleFolderContextMenu(e, folder)}
              >
                {isExpanded ? (
                  <FolderOpenIcon width={14} height={14} color="currentColor" />
                ) : (
                  <FolderIcon width={14} height={14} color="currentColor" />
                )}
                <span className="ml-2 flex-1">
                  {folder.folder_name}
                  {isDefaultFolder && (
                    <span className="text-zinc-500 text-xs ml-1">{t.sidebar.defaultFolder}</span>
                  )}
                </span>
                <span className="text-zinc-500 text-xs ml-2">
                  ({folderConnections.length})
                </span>
              </button>

              {/* Folder Connections */}
              {isExpanded && (
                <div className="ml-4 space-y-1">
                  {folderConnections.length === 0 ? (
                    <div className="text-zinc-500 text-xs py-2 px-4 select-none">
                      {t.sidebar.noConnections}
                    </div>
                  ) : (
                    folderConnections.map((connection) => {
                      const connectionKey = `connection-${connection.id}`;
                      const isConnectionHovered = hoveredItem === connectionKey;

                      return (
                        <button
                          key={connection.id}
                          className={`flex items-center rounded text-xs text-left py-2 px-4 text-white font-small shadow-sm transition cursor-pointer w-full ${isConnectionHovered && contextMenu.show
                              ? 'bg-zinc-700'
                              : 'hover:bg-zinc-800'
                            }`}
                          onDoubleClick={() => onDoubleClick(connection)}
                          onContextMenu={(e) => handleConnectionContextMenu(e, connection)}
                        >
                          <TerminalIcon width={14} height={14} color="#ffffff" />
                          <span className="ml-2">{connection.display_name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}

        {folders.length === 0 && conexiones.length === 0 && (
          <div className="text-zinc-500 text-center py-4 select-none">
            {t.sidebar.noConnections}
          </div>
        )}
      </div>

      {/* Context Menus */}
      {contextMenu.show && contextMenu.type === 'connection' && (
        <ContextMenuSidebar
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={handleConnectionEdit}
          onDelete={handleConnectionDelete}
          onTestConnection={handleConnectionTest}
          onClose={closeContextMenu}
        />
      )}

      {contextMenu.show && contextMenu.type === 'folder' && (
        <FolderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={handleFolderEdit}
          onDelete={handleFolderDelete}
          onClose={closeContextMenu}
        />
      )}

      {/* Folder Modal */}
      <FolderModal
        isOpen={showFolderModal}
        onClose={() => {
          setShowFolderModal(false);
          setEditingFolder(null);
        }}
        folder={editingFolder}
        title={editingFolder ? t.sidebar.editFolder : t.sidebar.newFolder}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmToast
        isOpen={showConfirmDialog}
        title={connectionToDelete ? t.sidebar.deleteConnection : "Delete Folder"}
        message={
          connectionToDelete
            ? t.sidebar.deleteConnectionMessage.replace("{name}", connectionToDelete.display_name)
            : `Are you sure you want to delete "${folderToDelete?.folder_name}"? This action cannot be undone.`
        }
        onConfirm={connectionToDelete ? confirmConnectionDelete : confirmFolderDelete}
        onCancel={cancelDelete}
        confirmText={isDeleting ? (connectionToDelete ? t.sidebar.deleting : "Deleting...") : (connectionToDelete ? t.sidebar.delete : "Delete")}
        cancelText={t.sidebar.cancel}
        isDestructive={true}
        loading={isDeleting}
      />

      {/* Alert Toast */}
      <AlertToast
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        loading={alertState.loading}
        onClose={() => setAlertState({
          isOpen: false,
          title: '',
          message: '',
          type: 'success',
          loading: false
        })}
      />
    </>
  );
};

export default ItemSidebarWithFolders;
