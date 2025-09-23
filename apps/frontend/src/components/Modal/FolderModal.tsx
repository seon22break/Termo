import { useState, useEffect } from "react";
import { useFolder } from "../../hooks/useFolder";
import { useI18n } from "../../context/I18nContext";
import type { Folder } from "../../core/Folder/domain/Folder";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder?: Folder | null;
  title: string;
}

const FolderModal = ({ isOpen, onClose, folder, title }: FolderModalProps) => {
  const { t } = useI18n();
  const { createFolder, updateFolder } = useFolder();
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (folder) {
      setFolderName(folder.folder_name);
    } else {
      setFolderName("");
    }
    setError("");

    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus on input when modal opens
      const input = document.getElementById('folderName') as HTMLInputElement;
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [folder, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = folderName.trim();
    
    if (!trimmedName) {
      setError(t.folders.folderNameRequired);
      return;
    }

    if (trimmedName.length > 255) {
      setError(t.folders.folderNameTooLong);
      return;
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedName)) {
      setError(t.folders.invalidCharacters);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (folder) {
        // Update existing folder
        await updateFolder(folder.id, trimmedName);
      } else {
        // Create new folder
        await createFolder(trimmedName);
      }
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFolderName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="folderName" className="block text-sm font-medium text-zinc-400 mb-2">
              Nombre de Carpeta {/* TODO: Use t.sidebar.folderName when types are updated */}
            </label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa el nombre de la carpeta" /* TODO: Use t.sidebar.enterFolderName when types are updated */
              maxLength={255}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar {/* TODO: Use t.connections.add.cancel when types are updated */}
            </button>
            <button
              type="submit"
              disabled={isLoading || !folderName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Guardando..." : (folder ? "Actualizar" : "Crear")} {/* TODO: Use translations when types are updated */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderModal;
