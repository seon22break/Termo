import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useTabActions } from "../../hooks/useTabActions";
import { useI18n } from "../../context/I18nContext";
import type { Connection } from "../../core/Client/domain/Client";
import ItemSidebarWithFolders from "./ItemSidebarWithFolders";
import TopSidebar from "./TopSidebar";
import HiddenSidebar from "./HiddenSidebar";
import BottomSidebar from "./BottomSidebar";

const Sidebar = () => {
  const { t } = useI18n();
  const { conexiones, sidebarOculto, ocultarSidebar, mostrarSidebar, reloadClient, isLoadingConnections } = useApp();
  const { openTerminalTab, openAddConnectionTab, openEditConnectionTab } = useTabActions();
  const [loadingMessage, setLoadingMessage] = useState(t.sidebar.loadingConnections);

  const sidebarStyle = sidebarOculto
    ? { 
        width: '56px', 
        minWidth: '56px', 
        maxWidth: '56px', 
        transition: 'all 0.3s ease-in-out' 
      }
    : { 
        width: '25vw', 
        minWidth: '260px', 
        maxWidth: '500px', 
        transition: 'all 0.3s ease-in-out' 
      };

  const handleDoubleClick = (connection: Connection) => {
    openTerminalTab(connection);
    console.log('Double click on:', connection.display_name);
  };

  const handleCreateConnection = () => {
    openAddConnectionTab();
  };

  const handleEdit = (connection: Connection) => {
    openEditConnectionTab(connection);
    console.log('Edit connection:', connection);
  };

  const handleConnectionDeleted = async () => {
    try {
      setLoadingMessage(t.sidebar.updatingConnections);
      await reloadClient();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside
      className="bg-zinc-900 flex flex-col h-full border-r border-[#1a1a1a] transition-all duration-300"
      style={sidebarStyle}
    >
      {sidebarOculto ? (
        <>
          <HiddenSidebar onShowSidebar={mostrarSidebar} />
          <div className="flex-1"></div>
          <BottomSidebar isHidden={true} />
        </>
      ) : (
        <>
          <div className="flex-shrink-0 p-4">
            <TopSidebar 
              onCreateConnection={handleCreateConnection}
              onHideSidebar={ocultarSidebar}
            />
          </div>
          
          <div className="flex-shrink-0 px-4">
            <span className='text-sm text-zinc-400 font-bold'>{t.sidebar.connections}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4">
            <ItemSidebarWithFolders
              conexiones={conexiones} 
              onDoubleClick={handleDoubleClick}
              onEdit={handleEdit}
              onConnectionDeleted={handleConnectionDeleted}
              isLoading={isLoadingConnections}
              loadingMessage={loadingMessage}
            />
          </div>
          
          <div className="flex-shrink-0 p-4">
            <BottomSidebar />
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
