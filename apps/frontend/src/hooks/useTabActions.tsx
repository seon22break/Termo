import { TabType } from "../types/PageSystem";
import type { Connection } from "../core/Client/domain/Client";
import { usePageSystem } from "./usePageSystem";

export const useTabActions = () => {
  const { openTab } = usePageSystem();

  const openTerminalTab = (connection: Connection) => {
    openTab(TabType.TERMINAL, { connection });
  };

  const openAddConnectionTab = () => {
    openTab(TabType.ADD_CONNECTION);
  };

  const openImportConnectionsTab = () => {
    openTab(TabType.IMPORT_CONNECTIONS);
  };

  const openSettingsTab = () => {
    openTab(TabType.SETTINGS);
  };

  const openEditConnectionTab = (connection: Connection) => {
    openTab(TabType.EDIT_CONNECTION, { connection });
  };

  const openPlaceholderTab = () => {
    openTab(TabType.PLACEHOLDER);
  };

  const openNotFoundTab = () => {
    openTab(TabType.NOT_FOUND);
  };

  const openNotAllowedTab = (props?: { title?: string; subtitle?: string; message?: string; onGoBack?: () => void }) => {
    openTab(TabType.NOT_ALLOWED, props);
  };

  return {
    openTerminalTab,
    openAddConnectionTab,
    openImportConnectionsTab,
    openSettingsTab,
    openEditConnectionTab,
    openPlaceholderTab,
    openNotFoundTab,
    openNotAllowedTab
  };
};
