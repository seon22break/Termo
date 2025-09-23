import type { ReactNode } from "react";

export interface PageConfig {
  id: string;
  name: string;
  showSidebar: boolean;
  showNavbar: boolean;
  staticContent?: ReactNode;
  allowTabs?: boolean;
}

export interface TabConfig {
  id: string;
  name: string;
  component: ReactNode;
  closeable?: boolean;
  icon?: ReactNode;
}

export const PageType = {
  PRINCIPAL: 'principal',
  SECURITY: 'security',
  WELCOME: 'welcome'
} as const;

export type PageTypeValues = typeof PageType[keyof typeof PageType];

export const TabType = {
  TERMINAL: 'terminal',
  ADD_CONNECTION: 'add-connection',
  IMPORT_CONNECTIONS: 'import-connections',
  SETTINGS: 'settings',
  PLACEHOLDER: 'placeholder',
  EDIT_CONNECTION: 'edit-connection',
  HELP: 'help',
  NOT_FOUND: 'not-found',
  NOT_ALLOWED: 'not-allowed'
} as const;

export type TabTypeValues = typeof TabType[keyof typeof TabType];
