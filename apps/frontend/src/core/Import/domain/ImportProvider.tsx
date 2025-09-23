export const ImportProvider = {
  MREMOTENG: 'mRemoteNG'
} as const;

export type ImportProvider = typeof ImportProvider[keyof typeof ImportProvider];

export interface ImportResult {
  success: boolean;
  connections: ImportedConnection[];
  errors: string[];
}

export interface ImportedConnection {
  host: string;
  port: number;
  display_name: string;
  user: string;
  password: string;
  sshkey: string;
  icon: string;
  folder_name?: string;
}
