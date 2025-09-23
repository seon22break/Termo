import type { Connection } from '../../Client/domain/Client';
import type { ImportProvider, ImportResult } from '../domain/ImportProvider';
import { ImportFileProcessor } from '../infrastructure/ImportFileProcessor.tsx';

export class ImportConnections {
  private processor: ImportFileProcessor;

  constructor(processor?: ImportFileProcessor) {
    this.processor = processor || new ImportFileProcessor();
  }

  async execute(file: File, provider: ImportProvider): Promise<Connection[]> {
    console.log('🚀 ImportConnections: Starting execution', { 
      fileName: file.name, 
      provider, 
      fileSize: file.size 
    });

    try {
      await this.validateFile(file, provider);
      
      console.log('📋 Processing file with provider:', provider);
      const importResult = await this.processor.processFile(file, provider);
      
      if (!importResult.success) {
        const errorMessage = importResult.errors.join(', ');
        throw new Error(`Processing error: ${errorMessage}`);
      }

      console.log('🔄 Converting imported connections to system format');
      const connections = this.convertToConnections(importResult.connections);
      
      console.log('✅ ImportConnections: Execution completed successfully', {
        connectionsCount: connections.length
      });
      
      return connections;
    } catch (error) {
      console.error('❌ ImportConnections: Error occurred:', error);
      
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unknown error occurred while importing connections';

      throw new Error(`Error in ImportConnections: ${errorMessage}`);
    }
  }

  private async validateFile(file: File, provider: ImportProvider): Promise<void> {
    console.log('🔍 Validating file:', { name: file.name, type: file.type, size: file.size, provider });
    
    if (!file.name.toLowerCase().endsWith('.xml')) {
      throw new Error('XML file required');
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File is too large (maximum 10MB)');
    }
    
    if (file.size === 0) {
      throw new Error('File is empty');
    }
    
    console.log('✅ File validation passed');
  }

  private convertToConnections(importedConnections: ImportResult['connections']): Connection[] {
    console.log('🔄 Converting imported connections to system format');
    
    return importedConnections.map((imported, index) => ({
      id: `imported_${Date.now()}_${index}`,
      host: imported.host,
      port: imported.port,
      display_name: imported.display_name,
      user: imported.user,
      password: imported.password,
      sshkey: imported.sshkey,
      icon: imported.icon,
      folder_id: '',
    }));
  }

  static async execute(file: File, provider: ImportProvider): Promise<Connection[]> {
    console.log('🔧 ImportConnections: Static execute called');
    const useCase = new ImportConnections();
    return useCase.execute(file, provider);
  }
}
