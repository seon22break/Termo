import React, { useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ImportConnections, ImportProvider, type ImportProvider as ImportProviderType } from '../core/Import';
import type { Connection } from '../core/Client/domain/Client';
import { useApp } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import AlertToast from '../components/Toasts/AlertToast';

interface ConnectionPreview extends Connection {
  status: 'pending' | 'processing' | 'success' | 'error';
  errorMessage?: string;
}

const ImportConnectionsTab: React.FC = () => {
  const { reloadClient } = useApp();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ImportProviderType>(ImportProvider.MREMOTENG);
  const [currentStep, setCurrentStep] = useState<'select' | 'preview' | 'importing'>('select');

  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [connectionsPreview, setConnectionsPreview] = useState<ConnectionPreview[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  const [showAlertToast, setShowAlertToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ title: '', message: '', type: 'success' });

  const resetState = () => {
    setSelectedFile(null);
    setSelectedProvider(ImportProvider.MREMOTENG);
    setCurrentStep('select');
    setIsProcessingFile(false);
    setIsImporting(false);
    setConnectionsPreview([]);
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCurrentStep('select');
      setConnectionsPreview([]);
      setImportError(null);
    }
  };



  const handlePreviewConnections = async () => {
    if (!selectedFile) return;

    setIsProcessingFile(true);
    setImportError(null);

    setAlertMessage({
      title: t.connections.import.processing,
      message: 'Procesando archivo de configuración...',
      type: 'info'
    });
    setShowAlertToast(true);

    try {
      const connections = await ImportConnections.execute(selectedFile, selectedProvider);
      
      const preview: ConnectionPreview[] = connections.map(conn => ({
        ...conn,
        status: 'pending' as const
      }));

      setConnectionsPreview(preview);
      setCurrentStep('preview');
      
      setAlertMessage({
        title: t.connections.import.fileProcessed,
        message: t.connections.import.connectionsFound.replace('{count}', preview.length.toString()),
        type: 'success'
      });
      setShowAlertToast(true);
    } catch (error) {
      console.error('❌ Error processing file:', error);
      const errorMessage = error instanceof Error ? error.message : t.connections.import.unknownError;
      setImportError(t.connections.import.errorProcessing.replace('{error}', errorMessage));
      
      setAlertMessage({
        title: t.connections.import.processingError,
        message: t.connections.import.errorProcessing.replace('{error}', errorMessage),
        type: 'error'
      });
      setShowAlertToast(true);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleImportConnections = async () => {
    if (connectionsPreview.length === 0) return;

    setIsImporting(true);
    setCurrentStep('importing');
    let successCount = 0;
    
    setAlertMessage({
      title: t.connections.import.importingConnections,
      message: t.connections.import.importingDescription,
      type: 'info'
    });
    setShowAlertToast(true);
    
    try {
      for (let i = 0; i < connectionsPreview.length; i++) {
        const connection = connectionsPreview[i];
        
        setConnectionsPreview(prev => prev.map((conn, index) => 
          index === i ? { ...conn, status: 'processing' } : conn
        ));

        try {
          await invoke("add_connection", {
            host: connection.host,
            port: connection.port,
            displayName: connection.display_name,
            user: connection.user,
            password: connection.password,
            sshkey: connection.sshkey,
            icon: connection.icon,
            folderId: "eec658fa-edd1-4fe9-b36e-a90ece79ce27"
          });

          setConnectionsPreview(prev => prev.map((conn, index) => 
            index === i ? { ...conn, status: 'success' } : conn
          ));
          
          successCount++;
        } catch (error) {
          console.error(`❌ Error importing connection "${connection.display_name}":`, error);
          const errorMessage = error instanceof Error ? error.message : t.connections.import.unknownError;
          
          setConnectionsPreview(prev => prev.map((conn, index) => 
            index === i ? { ...conn, status: 'error', errorMessage } : conn
          ));
        }

        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setAlertMessage({
        title: t.connections.import.importCompleted,
        message: t.connections.import.importedSuccess.replace('{success}', successCount.toString()).replace('{total}', connectionsPreview.length.toString()),
        type: successCount === connectionsPreview.length ? 'success' : 'warning'
      });
      setShowAlertToast(true);

      await reloadClient();

    } catch (error) {
      console.error('❌ Critical error during import:', error);
      setImportError(`Error crítico durante la importación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      
      setAlertMessage({
        title: "Error crítico",
        message: "Ocurrió un error durante la importación. Algunas conexiones podrían haberse importado.",
        type: 'error'
      });
      setShowAlertToast(true);
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusIcon = (status: ConnectionPreview['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 border border-zinc-500 rounded-full" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />;
      case 'success':
        return (
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getProviderDisplayName = (provider: ImportProviderType) => {
    switch (provider) {
      case ImportProvider.MREMOTENG:
        return 'mRemoteNG';
      default:
        return provider;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-zinc-900">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{t.connections.import.title}</h1>
            <p className="text-zinc-400 mt-1">
              {t.connections.import.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {currentStep === 'preview' && (
              <button
                onClick={() => setCurrentStep('select')}
                disabled={isImporting}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← {t.connections.import.goBack}
              </button>
            )}
            <button
              onClick={resetState}
              disabled={isProcessingFile || isImporting}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t.connections.import.reset}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-zinc-900">
        {currentStep === 'select' && (
          <div className="w-full space-y-6">

            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">
                {t.connections.import.configFile}
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xml"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg cursor-pointer transition-colors border border-zinc-600 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{t.connections.import.selectFileXML}</span>
                  </label>
                </div>
                {selectedFile && (
                  <div className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-zinc-400 text-sm">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-zinc-500">
                  {t.connections.import.fileDescription}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-zinc-300">mRemoteNG</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Compatible con archivos de configuración XML exportados desde mRemoteNG
                </p>
              </div>
            </div>

            {importError && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-red-400 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-300">{t.errors.processingError}</h4>
                    <p className="text-sm text-red-400 mt-1">{importError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={handlePreviewConnections}
                disabled={!selectedFile || isProcessingFile}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                <span>
                  {isProcessingFile ? t.connections.import.processing : t.connections.import.previewConnections}
                </span>
                {!isProcessingFile && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {(currentStep === 'preview' || currentStep === 'importing') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">{t.connections.import.previewTitle}</h3>
                <p className="text-zinc-400 mt-1">
                  {t.connections.import.connectionsFound.replace('{count}', connectionsPreview.length.toString()).replace('{provider}', getProviderDisplayName(selectedProvider))}
                </p>
              </div>
              {currentStep === 'preview' && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleImportConnections}
                    disabled={isImporting || connectionsPreview.length === 0}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>{t.connections.import.importConnections.replace('{count}', connectionsPreview.length.toString())}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 border border-zinc-700 rounded-lg overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto">
                {connectionsPreview.map((connection, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 hover:bg-zinc-800/50 border-b border-zinc-800 last:border-b-0">
                    <div className="flex-shrink-0">
                      {getStatusIcon(connection.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white truncate">
                          {connection.display_name}
                        </span>
                        <span className="text-sm text-zinc-500">
                          {connection.user}@{connection.host}:{connection.port}
                        </span>
                      </div>
                      {connection.status === 'error' && connection.errorMessage && (
                        <p className="text-xs text-red-400 mt-1">
                          {connection.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>
        )}
      </div>

      <AlertToast
        isOpen={showAlertToast}
        onClose={() => setShowAlertToast(false)}
        title={alertMessage.title}
        message={alertMessage.message}
        type={alertMessage.type}
      />
    </div>
  );
};

export default ImportConnectionsTab;
