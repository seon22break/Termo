import { createContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { invoke } from '@tauri-apps/api/core';
import type { Folder } from "../core/Folder/domain/Folder";

interface FolderState {
  folders: Folder[];
  isLoading: boolean;
  
  // Actions
  loadFolders: () => Promise<void>;
  createFolder: (name: string) => Promise<Folder>;
  updateFolder: (id: string, name: string) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  getFolderById: (id: string) => Promise<Folder | null>;
}

const FolderContext = createContext<FolderState | undefined>(undefined);

export { FolderContext };

export const FolderProvider = ({ children }: { children: ReactNode }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      const folderList = await invoke<Folder[]>('get_folders_cmd');
      setFolders(folderList);
    } catch (error) {
      console.error("Error loading folders:", error);
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFolder = async (name: string): Promise<Folder> => {
    try {
      const newFolder = await invoke<Folder>('create_folder_cmd', { 
        folderName: name 
      });
      await loadFolders();
      return newFolder;
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  };

  const updateFolder = async (id: string, name: string): Promise<Folder> => {
    try {
      const updatedFolder = await invoke<Folder>('update_folder_cmd', { 
        id, 
        folderName: name 
      });
      await loadFolders(); // Reload folders after update
      return updatedFolder;
    } catch (error) {
      console.error("Error updating folder:", error);
      throw error;
    }
  };

  const deleteFolder = async (id: string): Promise<void> => {
    try {
      await invoke('delete_folder_cmd', { id });
      await loadFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw error;
    }
  };

  const getFolderById = async (id: string): Promise<Folder | null> => {
    try {
      const folder = await invoke<Folder | null>('get_folder_by_id_cmd', { id });
      return folder;
    } catch (error) {
      console.error("Error getting folder by id:", error);
      return null;
    }
  };

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  return (
    <FolderContext.Provider
      value={{
        folders,
        isLoading,
        loadFolders,
        createFolder,
        updateFolder,
        deleteFolder,
        getFolderById,
      }}
    >
      {children}
    </FolderContext.Provider>
  );
};
