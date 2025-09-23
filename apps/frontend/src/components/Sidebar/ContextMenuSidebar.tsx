import React, { useRef, useEffect } from 'react';
import { useI18n } from '../../context/I18nContext';
import PencilEdit02Icon from "../../assets/Icons/pencil-edit-02-stroke-rounded";
import Delete01Icon from "../../assets/Icons/delete-01-stroke-rounded";
import ConnectIcon from "../../assets/Icons/connect-stroke-rounded";

interface ContextMenuSidebarProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onTestConnection: () => void;
  onClose: () => void;
}

const ContextMenuSidebar: React.FC<ContextMenuSidebarProps> = ({ x, y, onEdit, onDelete, onTestConnection, onClose }) => {
  const { t } = useI18n();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 min-w-[100px]"
      style={{ left: x, top: y }}
    >
      <button
        onClick={onEdit}
        className="w-full px-3 py-2 text-left text-white hover:bg-zinc-700 transition-colors rounded-lg flex items-center gap-2 text-xs"
      >
        <PencilEdit02Icon width={14} height={14} color="#ffffff" />
        {t.sidebar.edit}
      </button>
      <button
        onClick={onDelete}
        className="w-full px-3 py-2 text-left text-red-400 hover:bg-zinc-700 transition-colors rounded-lg flex items-center gap-2 text-xs"
      >
        <Delete01Icon width={14} height={14} color="#f87171" />
        {t.sidebar.delete}
      </button>
      <button
        onClick={onTestConnection}
        className="w-full px-3 py-2 text-left text-blue-400 hover:bg-zinc-700 transition-colors rounded-lg flex items-center gap-2 text-xs"
      >
        <ConnectIcon width={14} height={14} color="#60a5fa" />
        {t.sidebar.testConnectionAction}
      </button>
    </div>
  );
};

export default ContextMenuSidebar;
