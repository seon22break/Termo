import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useI18n } from '../../context/I18nContext';
import type { Connection } from "../../core/Connection/domain/Connection";
import ContextMenuSidebar from "./ContextMenuSidebar";
import ConfirmToast from "../Toasts/ConfirmToast";
import TerminalIcon from "../../assets/Icons/TerminalIcon";
import AlertToast from "../Toasts/AlertToast";
import Spinner from "../Loading/Spinner";

interface ItemSidebarProps {
  conexiones: Connection[];
  onDoubleClick: (connection: Connection) => void;
  onEdit?: (connection: Connection) => void;
  onConnectionDeleted?: () => void;
  isLoading?: boolean; 
  loadingMessage?: string; 
}

const ItemSidebar: React.FC<ItemSidebarProps> = ({ 
  conexiones, 
  onDoubleClick, 
  onEdit,
  onConnectionDeleted,
  isLoading = false,
  loadingMessage
}) => {
  const { t } = useI18n();
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    connection: Connection | null;
  }>({
    show: false,
    x: 0,
    y: 0,
    connection: null
  });

  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<Connection | null>(null);
  const [alertState, setAlertState] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info', loading: boolean}>({isOpen: false, title: '', message: '', type: 'success', loading: false});
  const [isDeleting, setIsDeleting] = useState(false);

  const handleContextMenu = (event: React.MouseEvent, connection: Connection, index: number) => {
    event.preventDefault();
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      connection
    });
    setHoveredItem(index);
  };

  const handleEdit = () => {
    if (contextMenu.connection && onEdit) {
      onEdit(contextMenu.connection);
    }
    closeContextMenu();
  };

  const handleDelete = () => {
    if (contextMenu.connection) {
      setConnectionToDelete(contextMenu.connection);
      setShowConfirmDialog(true);
    }
    closeContextMenu();
  };

  const handleTestConnection = async () => {
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
      console.error("Error testing connection:", error);
      setAlertState({
        isOpen: true,
        title: t.sidebar.connectionError,
        message: `${t.sidebar.connectionTo} ${host}:${port} ${t.sidebar.error}`,
        type: 'error',
        loading: false
      });
    }
    closeContextMenu();
  };

  const confirmDelete = async () => {
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
      console.error("Error deleting connection:", error);
      alert(t.sidebar.deleteConnectionError);
    } finally {
      setIsDeleting(false);
    }
    
    setShowConfirmDialog(false);
    setConnectionToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setConnectionToDelete(null);
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, connection: null });
    setHoveredItem(null);
  };

  return (
    <>
      <div className="space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" text={loadingMessage} />
          </div>
        ) : conexiones.length === 0 ? (
          <div className="text-zinc-500 text-center py-4 select-none">
            {t.sidebar.noConnections}
          </div>
        ) : (
          conexiones.map((connection, idx) => (
            <button
              key={idx}
              className={`flex items-center rounded text-xs text-left py-2 px-4 text-white font-small shadow-sm transition cursor-pointer w-full ${
                hoveredItem === idx && contextMenu.show 
                  ? 'bg-zinc-700' 
                  : 'hover:bg-zinc-800'
              }`}
              onDoubleClick={() => onDoubleClick(connection)}
              onContextMenu={(e) => handleContextMenu(e, connection, idx)}
            >
              <TerminalIcon width={14} height={14} color="#ffffff" />
              <span className="ml-2">{connection.display_name}</span>
            </button>
          ))
        )}
      </div>
      
      {contextMenu.show && (
        <ContextMenuSidebar
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTestConnection={handleTestConnection}
          onClose={closeContextMenu}
        />
      )}
      
      <ConfirmToast
        isOpen={showConfirmDialog}
        title={t.sidebar.deleteConnection}
        message={t.sidebar.deleteConnectionMessage.replace("{name}", connectionToDelete?.display_name || '')}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText={isDeleting ? t.sidebar.deleting : t.sidebar.delete}
        cancelText={t.sidebar.cancel}
        isDestructive={true}
        loading={isDeleting}
      />
      <AlertToast
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        loading={alertState.loading}
        onClose={() => setAlertState({isOpen: false, title: '', message: '', type: 'success', loading: false})}
      />
    </>
  );
};

export default ItemSidebar;
