import type { Connection } from "../core/Client/domain/Client";
import { useState, useEffect } from "react";
import { invoke } from '@tauri-apps/api/core';
import { useApp } from "../context/AppContext";
import { useI18n } from "../context/I18nContext";
import { useFolder } from "../hooks/useFolder";
import CustomInput from "../components/Form/CustomInput";
import AlertToast from "../components/Toasts/AlertToast";

interface EditConnectionTabProps {
  connection: Connection;
  onSuccess?: (connection: Connection) => void;
  onDelete?: (connectionId: string) => void;
}

const EditConnectionTab = ({ connection, onSuccess }: EditConnectionTabProps) => {
  const { reloadClient, closeTab } = useApp();
  const { t } = useI18n();
  const { folders } = useFolder();
  const [formData, setFormData] = useState<Connection>(connection);
  
  const [authType, setAuthType] = useState<"password" | "sshkey">(() => {
    if (connection.sshkey && connection.sshkey.trim() !== "" && (!connection.password || connection.password.trim() === "")) {
      return "sshkey";
    }
    return "password";
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showAlertToast, setShowAlertToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ title: '', message: '', type: 'success' });

  useEffect(() => {
    setFormData(connection);
    if (connection.sshkey && connection.sshkey.trim() !== "" && (!connection.password || connection.password.trim() === "")) {
      setAuthType("sshkey");
    } else {
      setAuthType("password");
    }
  }, [connection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!formData.host?.trim() || !formData.display_name?.trim() || !formData.user?.trim()) {
      setAlertMessage({
        title: t.connections.add.requiredFields,
        message: t.connections.add.completeAllFields,
        type: 'warning'
      });
      setShowAlertToast(true);
      setIsLoading(false);
      return;
    }

    if (authType === "password" && !formData.password?.trim()) {
      setAlertMessage({
        title: t.connections.add.passwordRequired,
        message: t.connections.add.enterPassword,
        type: 'warning'
      });
      setShowAlertToast(true);
      setIsLoading(false);
      return;
    }

    if (authType === "sshkey" && !formData.sshkey?.trim()) {
      setAlertMessage({
        title: t.connections.add.sshKeyRequired,
        message: t.connections.add.enterSshKey,
        type: 'warning'
      });
      setShowAlertToast(true);
      setIsLoading(false);
      return;
    }
    
    try {
      const submissionData = {
        ...formData,
        password: authType === "password" ? formData.password : "",
        sshkey: authType === "sshkey" ? formData.sshkey : "",
      };

      await invoke("update_connection", { connection: submissionData });
      
      setAlertMessage({
        title: t.connections.edit.connectionUpdated,
        message: t.connections.edit.connectionUpdatedSuccess.replace('{name}', formData.display_name),
        type: 'success'
      });
      setShowAlertToast(true);
      
      try {
        await reloadClient();
      } catch (loadError) {
        console.warn("Error reloading client:", loadError);
      }
      
      setTimeout(() => {
        closeTab(`${t.connections.edit.title.replace('{name}', connection.display_name)}`);
      }, 1000);
      
      if (onSuccess) {
        onSuccess(submissionData);
      }
      
    } catch (error) {
      console.error(error);

      let errorMessage = "Unknown error updating connection";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      setAlertMessage({
        title: t.connections.edit.errorUpdating,
        message: errorMessage,
        type: 'error'
      });
      setShowAlertToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Connection, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-1 w-full h-full bg-zinc-900 overflow-auto">
      <div className="w-full p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t.connections.edit.title.replace('{name}', connection.display_name)}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              id="display_name"
              name="display_name"
              label={t.connections.add.displayName}
              value={formData.display_name}
              onChange={(e) => handleInputChange("display_name", e.target.value)}
              required
            />

            <CustomInput
              id="host"
              name="host"
              label={t.connections.add.host}
              value={formData.host}
              onChange={(e) => handleInputChange("host", e.target.value)}
              required
            />

            <CustomInput
              id="user"
              name="user"
              label={t.connections.add.user}
              value={formData.user}
              onChange={(e) => handleInputChange("user", e.target.value)}
              required
            />

            <CustomInput
              id="port"
              name="port"
              type="number"
              label={t.connections.add.port}
              value={formData.port.toString()}
              onChange={(e) => handleInputChange("port", parseInt(e.target.value))}
            />

            <div>
              <label htmlFor="authType" className="block text-sm font-medium text-zinc-300 mb-2">
                {t.connections.add.authType}
                <span className="text-red-400 ml-1">*</span>
              </label>
              <select
                id="authType"
                name="authType"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                value={authType}
                onChange={(e) => setAuthType(e.target.value as "password" | "sshkey")}
              >
                <option value="password">{t.connections.add.authTypes.password}</option>
                <option value="sshkey">{t.connections.add.authTypes.sshkey}</option>
              </select>
            </div>

            <div>
              <label htmlFor="folder" className="block text-sm font-medium text-zinc-300 mb-2">
                Folder
              </label>
              <select
                id="folder"
                name="folder"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                value={formData.folder_id || "eec658fa-edd1-4fe9-b36e-a90ece79ce27"}
                onChange={(e) => handleInputChange("folder_id", e.target.value)}
              >
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.folder_name}
                  </option>
                ))}
              </select>
            </div>
             {authType === "password" ? (
            <CustomInput
              id="password"
              name="password"
              type="password"
              label={t.connections.add.password}
              placeholder={t.connections.add.passwordPlaceholder}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          ) : (
            <CustomInput
              id="sshkey"
              name="sshkey"
              label={t.connections.add.sshKey}
              placeholder={t.connections.add.sshKeyPlaceholder}
              value={formData.sshkey}
              onChange={(e) => handleInputChange("sshkey", e.target.value)}
              required
            />
          )}
          </div>

         

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
                isLoading 
                  ? "bg-gray-500 cursor-not-allowed" 
                  : "bg-zinc-700 hover:bg-zinc-600"
              } text-white`}
            >
              {isLoading ? t.connections.edit.saving : t.connections.edit.save}
            </button>
          </div>
        </form>

        {/* AlertToast */}
        <AlertToast
          isOpen={showAlertToast}
          title={alertMessage.title}
          message={alertMessage.message}
          type={alertMessage.type}
          onClose={() => setShowAlertToast(false)}
          autoClose={true}
          duration={3000}
        />
      </div>
    </div>
  );
};

export default EditConnectionTab;
