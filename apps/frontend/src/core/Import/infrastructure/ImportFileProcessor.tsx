import type { ImportProvider, ImportResult, ImportedConnection } from '../domain/ImportProvider';

export class ImportFileProcessor {
  
  async processFile(file: File, provider: ImportProvider): Promise<ImportResult> {
    console.log('🔍 ImportFileProcessor: Starting file processing', { 
      fileName: file.name, 
      provider 
    });
    
    try {
      const fileContent = await this.readFileContent(file);
      
      const connections = await this.processMRemoteNGFile(fileContent);
      
      console.log('✅ File processing completed successfully', {
        connectionsFound: connections.length
      });
      
      return {
        success: true,
        connections,
        errors: []
      };
    } catch (error) {
      console.error('❌ Error processing file:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error during file processing';
      
      return {
        success: false,
        connections: [],
        errors: [errorMessage]
      };
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Could not read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file, 'utf-8');
    });
  }



  private async processMRemoteNGFile(content: string): Promise<ImportedConnection[]> {
    console.log('🔧 Processing mRemoteNG file');
    
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      
      if (xmlDoc.querySelector('parsererror')) {
        throw new Error('Invalid XML file');
      }
      
      const connections: ImportedConnection[] = [];
      
      const nodes = xmlDoc.querySelectorAll('Node[Type="Connection"]');
      
      if (nodes.length === 0) {
        const allNodes = xmlDoc.querySelectorAll('Node');
        allNodes.forEach((node) => {
          if (node.getAttribute('Type') === 'Connection') {
            const connection = this.extractMRemoteConnection(node);
            if (connection) {
              connections.push(connection);
            }
          }
        });
      } else {
        nodes.forEach((node) => {
          const connection = this.extractMRemoteConnection(node);
          if (connection) {
            connections.push(connection);
          }
        });
      }
      
      console.log(`✅ mRemoteNG processing completed: ${connections.length} connections found`);
      return connections;
    } catch (error) {
      console.error('❌ Error processing mRemoteNG file:', error);
      throw new Error(`Error processing mRemoteNG file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }



  private extractMRemoteConnection(node: Element): ImportedConnection | null {
    try {
      const name = node.getAttribute('Name') || 'Unnamed';
      const hostname = node.getAttribute('Hostname') || '';
      const port = parseInt(node.getAttribute('Port') || '22', 10);
      const username = node.getAttribute('Username') || '';
      const password = node.getAttribute('Password') || '';
      const protocol = node.getAttribute('Protocol') || '';
      
      if (!hostname) {
        console.warn('⚠️ Skipping mRemoteNG node without hostname:', name);
        return null;
      }
      
      let defaultPort = 22;
      switch (protocol?.toUpperCase()) {
        case 'RDP':
          defaultPort = 3389;
          break;
        case 'TELNET':
          defaultPort = 23;
          break;
        case 'HTTP':
          defaultPort = 80;
          break;
        case 'HTTPS':
          defaultPort = 443;
          break;
        case 'VNC':
          defaultPort = 5900;
          break;
        default:
          defaultPort = 22; // SSH/SSH2
      }
      
      let parentNode = node.parentElement;
      let folderName = '';
      
      while (parentNode && parentNode.tagName === 'Node') {
        const parentType = parentNode.getAttribute('Type');
        const parentName = parentNode.getAttribute('Name');
        
        if (parentType === 'Container' && parentName && parentName !== 'Connections') {
          folderName = parentName;
          break;
        }
        parentNode = parentNode.parentElement;
      }
      
      return {
        host: hostname,
        port: isNaN(port) ? defaultPort : port,
        display_name: name,
        user: username,
        password: password,
        sshkey: '',
        icon: '',
        folder_name: folderName
      };
    } catch (error) {
      console.error('❌ Error extracting mRemoteNG connection:', error);
      return null;
    }
  }
}
