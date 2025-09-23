export interface Folder {
  id: string;
  name: string;
}

export type Connection = {
  id: string;
  host: string;
  port : number;
  display_name: string;
  user: string;
  password: string;
  sshkey: string;
  icon : string;
  folder_id: string;
};

export interface Setting {
  key: string;
  value: string;
}

export interface Client {
  client_type: string;
  operating_system: string;
  connections: Connection[];
  settings: Setting[];
  folders: Folder[];
}