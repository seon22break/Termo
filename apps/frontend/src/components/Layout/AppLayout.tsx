import type { ReactNode } from "react";
import { usePageSystem } from "../../hooks/usePageSystem";
import { useApp } from "../../context/AppContext";
import { useI18n } from "../../context/I18nContext";
import { PageType } from "../../types/PageSystem";
import PrincipalPage from "../../pages/PrincipalPage";
import SecurityPage from "../../pages/SecurityPage";
import WelcomePage from "../../pages/WelcomePage";
import FolderModal from "../Modal/FolderModal";
import TitleBar from "../TitleBar/TitleBar";

interface AppLayoutProps {
  children?: ReactNode;
  securityProps?: {
    onSubmit: (passphrase: string) => void;
    error?: string;
    attempts?: number;
    locked?: boolean;
  };
  welcomeProps?: {
    onSuccess?: () => void;
  };
}

const AppLayout = ({ children, securityProps, welcomeProps }: AppLayoutProps) => {
  const { currentPage } = usePageSystem();
  const { isFolderModalOpen, closeFolderModal } = useApp();
  const { t } = useI18n();

  const renderPage = () => {
    switch (currentPage) {
      case PageType.PRINCIPAL:
        return <PrincipalPage>{children}</PrincipalPage>;
      
      case PageType.SECURITY:
        return securityProps ? <SecurityPage {...securityProps} /> : <PrincipalPage>{children}</PrincipalPage>;
      
      case PageType.WELCOME:
        return welcomeProps ? <WelcomePage {...welcomeProps} /> : <PrincipalPage>{children}</PrincipalPage>;
        
      default:
        return <PrincipalPage>{children}</PrincipalPage>;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      <TitleBar />
      <div className="flex-1 overflow-hidden">
        {renderPage()}
      </div>

      {/* Global Folder Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={closeFolderModal}
        folder={null}
        title={t.search.newFolder}
      />
    </div>
  );
};

export default AppLayout;
