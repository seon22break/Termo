import { useTabActions } from "./useTabActions";
import { useApp } from "../context/AppContext";
import type { Connection } from "../core/Client/domain/Client";

/**
 * Hook de compatibilidad para migrar gradualmente del sistema anterior
 * al nuevo sistema de páginas y tabs
 */
export const useCompatibilityActions = () => {
  const newTabActions = useTabActions();
  const oldAppContext = useApp();

  return {
    // Acciones nuevas (recomendadas)
    ...newTabActions,
    
    openTerminalTabLegacy: (connection: Connection) => {
      newTabActions.openTerminalTab(connection);
      oldAppContext.openTerminalTab(connection);
    },
    
    openAddConnectionTabLegacy: () => {
      newTabActions.openAddConnectionTab();
      oldAppContext.openModal();
    },
    
    openPlaceholderTabLegacy: () => {
      newTabActions.openPlaceholderTab();
    },
    migrateToNewSystem: () => {
    }
  };
};
