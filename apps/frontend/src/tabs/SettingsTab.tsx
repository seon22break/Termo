import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useApp } from '../context/AppContext';
import { useTabActions } from '../hooks/useTabActions';
import { useI18n } from '../context/I18nContext';
import { SettingsI18nProvider, useSettingsI18n, type SettingConfig } from '../core/settings';
import CustomInput from '../components/Form/CustomInput';
import AlertToast from '../components/Toasts/AlertToast';

const SettingsTabContent: React.FC = () => {
  const { t } = useI18n();
  const { reloadClient } = useApp();
  const { openImportConnectionsTab } = useTabActions();
  const { 
    settingsState, 
    updateSetting,
    getSettingCurrentValue,
    isSettingConfigured,
    isSettingLoading
  } = useSettingsI18n();
  
  const [showAlertToast, setShowAlertToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ title: '', message: '', type: 'success' });

  const [showFactoryResetConfirm, setShowFactoryResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSettingChange = async (key: string, value: string) => {
    try {
      await updateSetting(key, value);
      await reloadClient();
      
      setAlertMessage({
        title: t.settings.configurationUpdated,
        message: t.settings.settingSavedSuccessfully.replace('{key}', key),
        type: 'success'
      });
      setShowAlertToast(true);
      
    } catch (error) {
      console.error(`❌ Error updating setting ${key}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setAlertMessage({
        title: t.settings.configurationError,
        message: t.settings.couldNotSaveSetting.replace('{key}', key).replace('{error}', errorMessage),
        type: 'error'
      });
      setShowAlertToast(true);
    }
  };

  const renderSettingInput = (settingConfig: SettingConfig) => {
    const currentValue = getSettingCurrentValue(settingConfig);
    const isLoading = isSettingLoading(settingConfig.key);

    switch (settingConfig.type) {
      case 'boolean':
        return (
          <div className="relative">
            <select
              id={`setting-${settingConfig.key}`}
              name={settingConfig.key}
              value={currentValue === 'true' || currentValue === '1' || currentValue === 'yes' ? 'true' : 'false'}
              onChange={(e) => handleSettingChange(settingConfig.key, e.target.value)}
              disabled={isLoading}
              className={`w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-zinc-600'
              }`}
            >
              <option value="false">{t.common.no}</option>
              <option value="true">{t.common.yes}</option>
            </select>
            
            {isLoading && (
              <div className="absolute right-8 top-2">
                <div className="w-4 h-4 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        );

      case 'select':
        if (!settingConfig.options) {
          console.warn(`Setting ${settingConfig.key} is of type 'select' but has no options defined`);
          return null;
        }
        
        return (
          <div className="relative">
            <select
              id={`setting-${settingConfig.key}`}
              name={settingConfig.key}
              value={currentValue}
              onChange={(e) => handleSettingChange(settingConfig.key, e.target.value)}
              disabled={isLoading}
              className={`w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-zinc-600'
              }`}
            >
              {settingConfig.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {settingConfig.options && (
              <div className="mt-1 text-xs text-zinc-400">
                {settingConfig.options.find(opt => opt.value === currentValue)?.label}
              </div>
            )}
            
            {isLoading && (
              <div className="absolute right-8 top-2">
                <div className="w-4 h-4 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="relative">
            <CustomInput
              id={`setting-${settingConfig.key}`}
              name={settingConfig.key}
              type={settingConfig.type}
              label=""
              placeholder={settingConfig.placeholder}
              value={currentValue}
              onChange={(e) => handleSettingChange(settingConfig.key, e.target.value)}
              disabled={isLoading}
              className="mb-0"
              inputClassName={isLoading ? 'opacity-50' : ''}
            />
            
            {isLoading && (
              <div className="absolute right-3 top-2">
                <div className="w-4 h-4 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        );
    }
  };

  const handleImportClick = () => {
    openImportConnectionsTab();
  };

  const handleFactoryReset = async () => {
    setIsResetting(true);
    try {

      
      await invoke("delete_database_cmd");
      
      setAlertMessage({
        title: t.settings.factoryResetCompleted,
        message: t.settings.databaseDeleted,
        type: 'success'
      });
      setShowAlertToast(true);
            
    } catch (error) {
      console.error( error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setAlertMessage({
        title: t.settings.factoryResetError,
        message: t.settings.couldNotCompleteReset.replace('{error}', errorMessage),
        type: 'error'
      });
      setShowAlertToast(true);
    } finally {
      setIsResetting(false);
      setShowFactoryResetConfirm(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-zinc-700">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.settings.title}</h1>
          <p className="text-zinc-400 mt-1">
            {t.settings.subtitle}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-8">
          {settingsState.availableSettings.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-zinc-800">
                <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-zinc-400">{t.settings.noSettingsAvailable}</p>
              <p className="text-zinc-500 text-sm mt-1">
                {t.settings.settingsWillAppear}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {settingsState.availableSettings.map((settingConfig: SettingConfig) => {
                return (
                  <div key={settingConfig.key} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-medium text-white flex items-center gap-2">
                          {settingConfig.label}
                        </h3>
                        {settingConfig.description && (
                          <p className="text-sm text-zinc-400 mt-1">
                            {settingConfig.description}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        {renderSettingInput(settingConfig)}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-4">
                          <span>
                            {t.settings.key}: <code className="bg-zinc-700 px-2 py-1 rounded">{settingConfig.key}</code>
                          </span>
                          {settingConfig.defaultValue && (
                            <span>
                              {t.settings.defaultValue}: <code className="bg-zinc-700 px-2 py-1 rounded">{settingConfig.defaultValue}</code>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isSettingConfigured(settingConfig.key) ? (
                            <span className="text-green-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {t.settings.configured}
                            </span>
                          ) : (
                            <span className="text-yellow-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {t.settings.default}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-zinc-700 my-8"></div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">{t.settings.tools}</h2>
              <p className="text-zinc-400 text-sm">
                {t.settings.additionalFunctions}
              </p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-1">
                    {t.settings.importFromOtherClient}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    {t.settings.importConnections}
                  </p>
                </div>
              </div>
              <button
                onClick={handleImportClick}
                className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                {t.settings.importConnectionsBtn}
              </button>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4 border border-red-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-400 mb-1">
                    {t.settings.factoryReset}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    {t.settings.factoryResetDescription}
                    <strong className="text-red-400"> {t.settings.actionCannotBeUndone}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFactoryResetConfirm(true)}
                disabled={isResetting}
                className="bg-zinc-700 hover:bg-zinc-800 disabled:bg-zinc-900 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
              >
                {isResetting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t.settings.resetting}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t.settings.factoryResetBtn}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFactoryResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 rounded-lg max-w-md w-full p-6 border border-red-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-400">
                  {t.settings.factoryResetConfirmTitle}
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-zinc-300 mb-3">
                {t.settings.factoryResetConfirmText}
              </p>
              <ul className="text-sm text-zinc-400 mb-4 space-y-1 pl-4">
                {t.settings.factoryResetList.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
              <p className="text-red-300 font-semibold">
                {t.settings.factoryResetWarning}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleFactoryReset}
                disabled={isResetting}
                className="flex-1 bg-red-700 hover:bg-red-800 disabled:bg-red-900 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors duration-200 font-semibold"
              >
                {isResetting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t.settings.resetting}
                  </div>
                ) : t.settings.yesFactoryReset}
              </button>
              <button
                onClick={() => setShowFactoryResetConfirm(false)}
                disabled={isResetting}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                {t.settings.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

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

const SettingsTab: React.FC = () => {
  return (
    <SettingsI18nProvider>
      <SettingsTabContent />
    </SettingsI18nProvider>
  );
};

export default SettingsTab;
