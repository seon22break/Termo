export { default as PlaceholderTab } from './PlaceholderTab';
export { default as AddConnectionTab } from './AddConnectionTab';
export { default as ImportConnectionsTab } from './ImportConnectionsTab';
export { default as SettingsTab } from './SettingsTab';
export { default as EditConnectionTab } from './EditConnectionTab';
export { default as NotFoundTab } from './NotFoundTab';
export { default as NotAllowedTab } from './NotAllowedTab';

export const TAB_CATEGORIES = {
  CONNECTION_MANAGEMENT: 'connection-management',
  TERMINAL: 'terminal',
  SYSTEM: 'system',
  UTILITIES: 'utilities'
} as const;

export type TabCategory = typeof TAB_CATEGORIES[keyof typeof TAB_CATEGORIES];
