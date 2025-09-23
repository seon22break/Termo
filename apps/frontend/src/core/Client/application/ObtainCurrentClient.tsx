import type { Client } from '../domain/Client';
import { InTauriBackendRepository } from '../infrastructure/InTauriBackendRepository';

export class ObtainCurrentClient {
  private repository: InTauriBackendRepository;

  constructor(repository?: InTauriBackendRepository) {
    this.repository = repository || new InTauriBackendRepository();
  }
  
  async execute(): Promise<Client> {
    console.log('🚀 ObtainCurrentClient: Starting execution');
    
    try {
      console.log('📞 Calling repository.getClient()');
      const client = await this.repository.getClient();
      
      console.log('✅ ObtainCurrentClient: Client obtained successfully');
      return client;
    } catch (error) {
      console.error('❌ ObtainCurrentClient: Error occurred:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido al obtener el cliente';
      
      throw new Error(`Error in ObtainCurrentClient: ${errorMessage}`);
    }
  }


  static async execute(): Promise<Client> {
    console.log('🔧 ObtainCurrentClient: Static execute called');
    const useCase = new ObtainCurrentClient();
    return useCase.execute();
  }
}