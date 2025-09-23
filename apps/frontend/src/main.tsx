import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './context/AppContext'
import { ShortcutsProvider } from './context/ShortcutsContext';
import { SettingsProvider } from './core/settings';
import { FolderProvider } from './context/FolderContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShortcutsProvider>
      <AppProvider>
        <FolderProvider>
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </FolderProvider>
      </AppProvider>
    </ShortcutsProvider>
  </StrictMode>,
)
