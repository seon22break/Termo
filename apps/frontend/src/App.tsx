import { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useShortcut } from "./context/ShortcutsContext";
import { PageSystemProvider } from "./context/PageSystemContext";
import { I18nProvider } from "./context/I18nContext";
import { I18nLanguageSync } from "./components/I18n/I18nLanguageSync";
import { usePageSystem } from "./hooks/usePageSystem";
import { PageType } from "./types/PageSystem";
import AppLayout from "./components/Layout/AppLayout";
import CommandPalleteModal from "./components/Modal/CommandPalleteModal";
import { useApp } from "./context/AppContext";

const AppContent = () => {
  const { setCurrentPage } = usePageSystem();
  const { reloadClient, toggleSidebar } = useApp();
  const [isCommandModalOpen, setCommandModalOpen] = useState(false);

  const [showSecurityPage, setShowSecurityPage] = useState(false);
  const [passphraseError, setPassphraseError] = useState("");
  const [passphraseAttempts, setPassphraseAttempts] = useState(0);
  const [passphraseLocked, setPassphraseLocked] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useShortcut("Ctrl+P", () => {
    setCommandModalOpen(true);
  });

  useShortcut("Ctrl+B", () => {
    toggleSidebar();
  });

  useEffect(() => {
    const checkInitialState = async () => {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };
      window.addEventListener("contextmenu", handleContextMenu);

      try {
        const result = await invoke<string | null>("read_setting_cmd", { key: "first_access" });
        if (!result) {
          setCurrentPage(PageType.WELCOME);
          setShowWelcome(true);
        } else if (result === "1") {
          setCurrentPage(PageType.SECURITY);
          setShowSecurityPage(true);
        } else {
          setCurrentPage(PageType.PRINCIPAL);
        }
      } catch {
        setCurrentPage(PageType.WELCOME);
        setShowWelcome(true);
      }

      return () => {
        window.removeEventListener("contextmenu", handleContextMenu);
      };
    };
    checkInitialState();
  }, [setCurrentPage]);

  const handleWelcomeSuccess = useCallback(() => {
    localStorage.setItem("termo_passphrase_set", "1");
    setShowWelcome(false);
    setCurrentPage(PageType.SECURITY);
    setShowSecurityPage(true);
  }, [setCurrentPage]);

  const handlePassphraseSubmit = async (passphrase: string) => {

    function increaseAttempts() {
      const newAttempts = passphraseAttempts + 1;
      setPassphraseAttempts(newAttempts);
      setPassphraseError("Passphrase incorrecta");
      if (newAttempts >= 3) {
        setPassphraseLocked(true);
      }
    }

    try {
      const valid = await invoke<boolean>("validate_passphrase_cmd", { passphrase });
      if (valid) {
        setShowSecurityPage(false);
        setPassphraseError("");
        setPassphraseAttempts(0);
        
        console.log('🔐 Passphrase validated, obtaining client...');
        try {
          await reloadClient();
          console.log('✅ Client obtained successfully');
        } catch (clientError) {
          console.error("❌ Error obtaining client:", clientError);
        }
        
        setCurrentPage(PageType.PRINCIPAL);
      } else {
        increaseAttempts();
      }
    } catch {
        increaseAttempts();
    }
  };

  return (
    <>
      <CommandPalleteModal 
        isOpen={isCommandModalOpen} 
        onClose={() => setCommandModalOpen(false)} 
      />
      <AppLayout 
        securityProps={showSecurityPage ? {
          onSubmit: handlePassphraseSubmit,
          error: passphraseError,
          attempts: passphraseAttempts,
          locked: passphraseLocked
        } : undefined}
        welcomeProps={showWelcome ? {
          onSuccess: handleWelcomeSuccess
        } : undefined}
      />
    </>
  );
};

function App() {
  return (
    <I18nProvider>
      <I18nLanguageSync />
      <PageSystemProvider>
        <AppContent />
      </PageSystemProvider>
    </I18nProvider>
  );
}

export default App;
