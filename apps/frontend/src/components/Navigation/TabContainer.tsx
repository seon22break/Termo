import type { TabConfig } from "../../types/PageSystem";
import { usePageSystem } from "../../hooks/usePageSystem";
import PlaceholderTab from "../../tabs/PlaceholderTab";

interface TabContainerProps {
  tabs: TabConfig[];
  activeTabId: string | null;
}

const TabContainer = ({ tabs, activeTabId }: TabContainerProps) => {
  const { closeTab, setActiveTab } = usePageSystem();

  if (tabs.length === 0 || !activeTabId) {
    return (
      <div className="h-full w-full flex flex-col bg-zinc-900">
        <PlaceholderTab
          title="Termo"
          subtitle="Simply and Fast"
        />
      </div>
    );
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId);


  const isTerminalTab = activeTab?.id?.startsWith('terminal-') || 
                        activeTab?.name?.toLowerCase().includes('terminal') || 
                        false;
  const backgroundClass = isTerminalTab ? 'bg-black' : 'bg-zinc-900';

  return (
    <div className="flex flex-col h-full w-full">
      {/* Barra de tabs */}
      <div className="flex bg-gray-800 border-b border-gray-600 flex-shrink-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`
              flex items-center px-4 py-2 border-r border-gray-600 cursor-pointer
              ${activeTabId === tab.id 
                ? 'bg-zinc-900 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }
            `}
            onClick={() => setActiveTab(tab.id)}
          >
            {/* Icono si existe */}
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            
            {/* Nombre del tab */}
            <span className="text-sm font-medium truncate max-w-32">
              {tab.name}
            </span>

            {/* Botón de cerrar si es cerrable */}
            {tab.closeable && (
              <button
                className="ml-2 p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <svg 
                  className="w-3 h-3" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Contenido de la tab activa */}
      <div 
        className={`flex-1 w-full min-h-0 overflow-hidden text-white ${backgroundClass}`}
      >
        <div className="h-full w-full overflow-auto">
          {activeTab?.component || (
            <div className="text-white p-6">Sin contenido</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabContainer;
