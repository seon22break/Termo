import { createContext, useState, type ReactNode } from "react";
import type { PageConfig, TabConfig, PageTypeValues, TabTypeValues } from "../types/PageSystem";
import { PageType, TabType } from "../types/PageSystem";
import type { Connection } from "../core/Client/domain/Client";
import { useI18n } from "./I18nContext";

import Terminal from "../components/Terminal/Terminal";
import PlaceholderTab from "../tabs/PlaceholderTab";
import AddConnectionTab from "../tabs/AddConnectionTab";
import ImportConnectionsTab from "../tabs/ImportConnectionsTab";
import SettingsTab from "../tabs/SettingsTab";
import EditConnectionTab from "../tabs/EditConnectionTab";
import NotFoundTab from "../tabs/NotFoundTab";
import NotAllowedTab from "../tabs/NotAllowedTab";

interface TabData {
  connection?: Connection;
  onSuccess?: () => void;
  onGoBack?: () => void;
  title?: string;
  subtitle?: string;
  message?: string;
  [key: string]: unknown;
}

interface PageSystemState {
  currentPage: PageTypeValues;
  setCurrentPage: (page: PageTypeValues) => void;
  getPageConfig: (page: PageTypeValues) => PageConfig;
  
  openTabs: TabConfig[];
  activeTabId: string | null;
  openTab: (type: TabTypeValues, data?: TabData) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeAllTabs: () => void;
  
  generateTabId: (type: TabTypeValues, data?: TabData) => string;
  getTabComponent: (type: TabTypeValues, data?: TabData) => ReactNode;
}

const PageSystemContext = createContext<PageSystemState | undefined>(undefined);

export { PageSystemContext };

export const PageSystemProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useI18n();
  const [currentPage, setCurrentPage] = useState<PageTypeValues>(PageType.PRINCIPAL);
  const [openTabs, setOpenTabs] = useState<TabConfig[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const getPageConfig = (page: PageTypeValues): PageConfig => {
    const configs: Record<PageTypeValues, PageConfig> = {
      [PageType.PRINCIPAL]: {
        id: PageType.PRINCIPAL,
        name: t.pageSystem.pages.principal,
        showSidebar: true,
        showNavbar: true,
        allowTabs: true
      },
      [PageType.SECURITY]: {
        id: PageType.SECURITY,
        name: t.pageSystem.pages.security,
        showSidebar: false,
        showNavbar: false,
        allowTabs: false
      },
      [PageType.WELCOME]: {
        id: PageType.WELCOME,
        name: t.pageSystem.pages.welcome,
        showSidebar: false,
        showNavbar: false,
        allowTabs: false
      }
    };
    return configs[page];
  };

  const generateTabId = (type: TabTypeValues, data?: TabData): string => {
    switch (type) {
      case TabType.TERMINAL:
        return `terminal-${data?.connection?.id || 'unknown'}`;
      case TabType.ADD_CONNECTION:
        return 'add-connection';
      case TabType.IMPORT_CONNECTIONS:
        return 'import-connections';
      case TabType.SETTINGS:
        return 'settings';
      case TabType.EDIT_CONNECTION:
        return `edit-connection-${data?.connection?.id || 'unknown'}`;
      case TabType.PLACEHOLDER:
        return 'placeholder';
      case TabType.HELP:
        return 'help';
      case TabType.NOT_FOUND:
        return 'not-found';
      case TabType.NOT_ALLOWED:
        return 'not-allowed';
      default:
        return `tab-${type}-${Date.now()}`;
    }
  };

  const getTabComponent = (type: TabTypeValues, data?: TabData): ReactNode => {
    switch (type) {
      case TabType.TERMINAL:
        return data?.connection ? <Terminal connection={data.connection} /> : <PlaceholderTab />;
      case TabType.ADD_CONNECTION:
        return <AddConnectionTab />;
      case TabType.IMPORT_CONNECTIONS:
        return <ImportConnectionsTab />;
      case TabType.SETTINGS:
        return <SettingsTab />;
      case TabType.EDIT_CONNECTION:
        return data?.connection ? (
          <EditConnectionTab connection={data.connection} />
        ) : (
          <div className="p-6 text-white">{t.pageSystem.errors.connectionNotFound}</div>
        );
      case TabType.PLACEHOLDER:
        return (
          <PlaceholderTab
            title="Termo"
            subtitle="Simply and Fast"
          />
        );
      case TabType.NOT_FOUND:
        return <NotFoundTab />;
      case TabType.NOT_ALLOWED:
        return <NotAllowedTab />;
      default:
        return <div>{t.pageSystem.errors.contentNotFound}</div>;
    }
  };

  const getTabName = (type: TabTypeValues, data?: TabData): string => {
    switch (type) {
      case TabType.TERMINAL:
        return `${t.pageSystem.tabs.terminal}: ${data?.connection?.display_name || 'Unknown'}`;
      case TabType.ADD_CONNECTION:
        return t.pageSystem.tabs.addConnection;
      case TabType.IMPORT_CONNECTIONS:
        return t.pageSystem.tabs.importConnections;
      case TabType.SETTINGS:
        return t.pageSystem.tabs.settings;
      case TabType.EDIT_CONNECTION:
        return `${t.pageSystem.tabs.editConnection}: ${data?.connection?.display_name || 'Unknown'}`;
      case TabType.PLACEHOLDER:
        return t.pageSystem.tabs.placeholder;
      case TabType.HELP:
        return t.pageSystem.tabs.help;
      case TabType.NOT_FOUND:
        return t.pageSystem.tabs.notFound;
      case TabType.NOT_ALLOWED:
        return t.pageSystem.tabs.notAllowed;
      default:
        return t.pageSystem.tabs.newTab;
    }
  };

  const openTab = (type: TabTypeValues, data?: TabData) => {
    const tabId = generateTabId(type, data);
    
    const existingTab = openTabs.find(tab => tab.id === tabId);
    if (existingTab) {
      setActiveTabId(tabId);
      return;
    }

    const newTab: TabConfig = {
      id: tabId,
      name: getTabName(type, data),
      component: getTabComponent(type, data),
      closeable: type !== TabType.PLACEHOLDER
    };

    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(tabId);
  };

  const closeTab = (tabId: string) => {
    setOpenTabs(prev => {
      const filteredTabs = prev.filter(tab => tab.id !== tabId);
      
      if (activeTabId === tabId) {
        const currentIndex = prev.findIndex(tab => tab.id === tabId);
        if (filteredTabs.length === 0) {
          setActiveTabId(null);
        } else if (currentIndex > 0) {
          setActiveTabId(filteredTabs[currentIndex - 1].id);
        } else {
          setActiveTabId(filteredTabs[0].id);
        }
      }
      
      return filteredTabs;
    });
  };

  const setActiveTab = (tabId: string) => {
    const tabExists = openTabs.some(tab => tab.id === tabId);
    if (tabExists) {
      setActiveTabId(tabId);
    }
  };

  const closeAllTabs = () => {
    setOpenTabs([]);
    setActiveTabId(null);
  };

  return (
    <PageSystemContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        getPageConfig,
        openTabs,
        activeTabId,
        openTab,
        closeTab,
        setActiveTab,
        closeAllTabs,
        generateTabId,
        getTabComponent
      }}
    >
      {children}
    </PageSystemContext.Provider>
  );
};
