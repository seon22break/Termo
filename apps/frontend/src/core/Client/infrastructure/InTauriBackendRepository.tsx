import { invoke } from '@tauri-apps/api/core';
import type { Client } from '../domain/Client';

export class InTauriBackendRepository {
  
  async getClient(): Promise<Client> {
    console.log('🔍 InTauriBackendRepository: Starting getClient()');
    
    try {
      console.log('📡 Invoking get_client_cmd...');
      const client = await invoke<Client>('get_client_cmd');
      console.log('📨 Response received:', client);
      
      if (!client) {
        console.error('❌ Backend returned null/undefined client');
        throw new Error('Backend did not return client information');
      }
      
      console.log('✅ Client successfully retrieved:', {
        client_type: client.client_type,
        operating_system: client.operating_system,
        connectionsCount: client.connections?.length || 0,
        settingsCount: client.settings?.length || 0,
        foldersCount: client.folders?.length || 0
      });
      
      return client;
    } catch (error) {
      console.error('❌ Error in getClient():', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error de comunicación con el backend';
      
      throw new Error(`Error in InTauriBackendRepository.getClient(): ${errorMessage}`);
    }
  }
}