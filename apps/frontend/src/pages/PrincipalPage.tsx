import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import TabContainer from "../components/Navigation/TabContainer";
import { usePageSystem } from "../hooks/usePageSystem";

interface PrincipalPageProps {
  children?: ReactNode;
}

const PrincipalPage = ({ children }: PrincipalPageProps) => {
  const { openTabs, activeTabId } = usePageSystem();

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="h-full">
        <Sidebar />
      </div>

      {/* Principal content */}
      <div className="flex flex-col flex-1 h-full">
        {/* Tabs Container */}
        <div className="flex-1 w-full min-h-0 overflow-hidden">
          <TabContainer
            tabs={openTabs}
            activeTabId={activeTabId}
          />
        </div>
      </div>

      {/* Additional content if provided */}
      {children}
    </div>
  );
};

export default PrincipalPage;
