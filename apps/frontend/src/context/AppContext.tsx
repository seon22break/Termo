import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { Connection, Client } from "../core/Client/domain/Client";
import Terminal from "../components/Terminal/Terminal";
import { ObtainCurrentClient } from "../core/Client/application/ObtainCurrentClient";

interface AppState {
  isModalOpen: boolean;
  openModal: (connection?: Connection) => void;
  closeModal: () => void;
  modalData?: Connection | null;

  selectedConnection?: Connection | null;
  setSelectedConnection: (conn: Connection | null) => void;

  client: Client | null;
  setClient: (client: Client | null) => void;
  reloadClient: () => Promise<void>;
  isLoadingConnections: boolean;

  conexiones: Connection[];
  setConexiones: React.Dispatch<React.SetStateAction<Connection[]>>;
  loadConnections: () => Promise<void>;
  loadConnectionsDecrypted: () => Promise<Connection[]>;

  sidebarOculto: boolean;
  ocultarSidebar: () => void;
  mostrarSidebar: () => void;
  toggleSidebar: () => void;



  openTabs: string[];
  activeTab: string | null;
  openTab: (name: string, content?: ReactNode) => void;
  setActiveTab: (name: string) => void;
  closeTab: (name: string) => void;
  tabContents: Record<string, ReactNode>;
  setTabContent: (name: string, content: ReactNode) => void;
  openTerminalTab: (connection: Connection) => void;

  // Folder Modal states
  isFolderModalOpen: boolean;
  openFolderModal: () => void;
  closeFolderModal: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Connection | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [conexiones, setConexiones] = useState<Connection[]>([]);
  const [sidebarOculto, setSidebarOculto] = useState(false);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [tabContents, setTabContents] = useState<Record<string, ReactNode>>({});
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  
  // Folder Modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const loadConnections = useCallback(async () => {
    try {
      if (client) {
        setConexiones(client.connections);
      } else {
        setConexiones([]);
      }
    } catch (error) {
      setConexiones([]);
    }
  }, [client]);

  const loadConnectionsDecrypted = useCallback(async () => {
    try {
      if (client) {
        return client.connections;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }, [client]);

  const reloadClient = useCallback(async () => {
    try {
      setIsLoadingConnections(true);
      const newClient = await ObtainCurrentClient.execute();
      setClient(newClient);
      setConexiones(newClient.connections);
    } catch (error) {
       console.log("Client loaded error:", error);
    } finally {
      setIsLoadingConnections(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const openModal = (connection?: Connection) => {
    setModalData(connection || null);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  // Folder Modal functions
  const openFolderModal = () => {
    setIsFolderModalOpen(true);
  };
  
  const closeFolderModal = () => {
    setIsFolderModalOpen(false);
  };

  const ocultarSidebar = () => setSidebarOculto(true);
  const mostrarSidebar = () => setSidebarOculto(false);
  const toggleSidebar = () => setSidebarOculto(prev => !prev);



  const openTab = (name: string, content?: ReactNode) => {
    setOpenTabs((tabs) => (tabs.includes(name) ? tabs : [...tabs, name]));
    setActiveTab(name);
    if (content) setTabContents((prev) => ({ ...prev, [name]: content }));
  };

  const closeTab = (name: string) => {
    setOpenTabs((tabs) => {
      const idx = tabs.indexOf(name);
      const newTabs = tabs.filter(tab => tab !== name);
      setActiveTab((current) => {
        if (current !== name) return current;
        if (newTabs.length === 0) return null;
        if (idx > 0) return newTabs[idx - 1];
        return newTabs[0];
      });
      return newTabs;
    });
    setTabContents((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const setTabContent = (name: string, content: ReactNode) => {
    setTabContents((prev) => ({ ...prev, [name]: content }));
  };

  const openTerminalTab = (connection: Connection) => {
    const tabName = `Terminal: ${connection.display_name}`;
    openTab(tabName, <Terminal connection={connection} />);
  };

  return (
    <AppContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal,
        modalData,
        selectedConnection,
        setSelectedConnection,
        client,
        setClient,
        reloadClient,
        isLoadingConnections,
        conexiones,
        setConexiones,
        loadConnections,
        loadConnectionsDecrypted,
        sidebarOculto,
        ocultarSidebar,
        mostrarSidebar,
        toggleSidebar,

        openTabs,
        activeTab,
        openTab,
        setActiveTab,
        closeTab,
        tabContents,
        setTabContent,
        openTerminalTab,
        isFolderModalOpen,
        openFolderModal,
        closeFolderModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}; 