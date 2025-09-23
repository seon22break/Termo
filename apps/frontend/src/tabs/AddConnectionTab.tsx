import type { Connection } from "../core/Client/domain/Client";
import { useState } from "react";
import { invoke } from '@tauri-apps/api/core';
import { useApp } from "../context/AppContext";
import { useI18n } from "../context/I18nContext";
import { useFolder } from "../hooks/useFolder";
import CustomInput from "../components/Form/CustomInput";
import AlertToast from "../components/Toasts/AlertToast";

interface AddConnectionTabProps {
  onSuccess?: (connection: Connection) => void;
  onCancel?: () => void;
}

const AddConnectionTab = ({ onSuccess, onCancel }: AddConnectionTabProps) => {
  const { reloadClient, closeTab } = useApp();
  const { t } = useI18n();
  const { folders } = useFolder();
  const [formData, setFormData] = useState<Partial<Connection>>({
    host: "",
    port: 22,
    display_name: "",
    user: "",
    password: "",
    sshkey: "",
    icon: "",
    folder_id: "eec658fa-edd1-4fe9-b36e-a90ece79ce27" // default folder
  });

  const [authType, setAuthType] = useState<"password" | "sshkey">("password");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlertToast, setShowAlertToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ title: '', message: '', type: 'success' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
      await invoke("add_connection", {
        host: formData.host.trim(),
        port: formData.port || 22,
        displayName: formData.display_name.trim(),
        user: formData.user.trim(),
        password: authType === "password" ? formData.password : "",
        sshkey: authType === "sshkey" ? formData.sshkey : "",
        icon: "",
        folderId: formData.folder_id || "eec658fa-edd1-4fe9-b36e-a90ece79ce27"
      });
            
      setAlertMessage({
        title: t.connections.add.connectionCreated,
        message: t.connections.add.connectionCreatedSuccess.replace('{name}', formData.display_name || ''),
        type: 'success'
      });
      setShowAlertToast(true);
      
      try {
        await reloadClient();
      } catch (loadError) {
        console.warn("Error reloading client:", loadError);
      }
      
        setFormData({
        host: "",
        port: 22,
        display_name: "",
        user: "",
        password: "",
        sshkey: "",
        icon: "",
        folder_id: "eec658fa-edd1-4fe9-b36e-a90ece79ce27"
      });
      setAuthType("password");
      
      setTimeout(() => {
        closeTab("Nueva conexion");
      }, 1000);
      
      if (onSuccess) onSuccess(formData as Connection);
      
    } catch (err) {
      console.error(err);
      
      let errorMessage = "Unknown error creating connection";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      setAlertMessage({
        title: t.connections.add.errorCreating,
        message: errorMessage,
        type: 'error'
      });
      setShowAlertToast(true);
      
      setError(errorMessage);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t.connections.add.title}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <CustomInput
              id="display_name"
              name="display_name"
              label={t.connections.add.displayName}
              placeholder={t.connections.add.displayNamePlaceholder}
              value={formData.display_name || ""}
              onChange={(e) => handleInputChange("display_name", e.target.value)}
              required
              autoFocus={true}
            />


            <CustomInput
              id="host"
              name="host"
              label={t.connections.add.host}
              placeholder={t.connections.add.hostPlaceholder}
              value={formData.host || ""}
              onChange={(e) => handleInputChange("host", e.target.value)}
              required
            />


            <CustomInput
              id="user"
              name="user"
              label={t.connections.add.user}
              placeholder={t.connections.add.userPlaceholder}
              value={formData.user || ""}
              onChange={(e) => handleInputChange("user", e.target.value)}
              required
            />

            <CustomInput
              id="port"
              name="port"
              type="number"
              label={t.connections.add.port}
              placeholder={t.connections.add.portPlaceholder}
              value={formData.port?.toString() || "22"}
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
                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
              value={formData.password || ""}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          ) : (
            <CustomInput
              id="sshkey"
              name="sshkey"
              label={t.connections.add.sshKey}
              placeholder={t.connections.add.sshKeyPlaceholder}
              value={formData.sshkey || ""}
              onChange={(e) => handleInputChange("sshkey", e.target.value)}
              required
            />
          )}
          </div>
          
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-6 py-3 font-medium rounded-lg transition-colors duration-200 ${
                isLoading 
                  ? "bg-gray-500 cursor-not-allowed" 
                  : "bg-zinc-700 hover:bg-zinc-600"
              } text-white`}
            >
              {isLoading ? t.connections.add.saving : t.connections.add.save}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {t.connections.add.cancel}
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-700 text-red-400 rounded-lg">
            {error}
          </div>
        )}

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

export default AddConnectionTab;
