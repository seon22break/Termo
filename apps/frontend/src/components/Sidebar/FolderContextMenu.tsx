import React from 'react';
import { useI18n } from '../../context/I18nContext';

interface FolderContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  x,
  y,
  onEdit,
  onDelete,
  onClose
}) => {
  const { t } = useI18n();

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.folder-context-menu')) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="folder-context-menu fixed z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-2 min-w-[140px] animate-in fade-in duration-150"
      style={{ left: x, top: y }}
    >
      <button
        onClick={onEdit}
        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors duration-150 flex items-center"
      >
        <svg className="w-4 h-4 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {t.sidebar.editFolder}
      </button>
      
      <div className="h-px bg-zinc-700 my-1"></div>
      
      <button
        onClick={onDelete}
        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 hover:text-red-300 transition-colors duration-150 flex items-center"
      >
        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {t.sidebar.deleteFolder}
      </button>
    </div>
  );
};

export default FolderContextMenu;
