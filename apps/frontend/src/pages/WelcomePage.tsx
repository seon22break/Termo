import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useI18n } from "../context/I18nContext";

interface WelcomePageProps {
  onSuccess?: () => void;
}


const WelcomePage: React.FC<WelcomePageProps> = ({ onSuccess }) => {
  const { t } = useI18n();
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);
  const [checkingCompatibility, setCheckingCompatibility] = useState(true);

  useEffect(() => {
    const checkSystemCompatibility = async () => {
      try {
        setCheckingCompatibility(true);
        const systemType = await invoke("detect_system_cmd");
        
        if (systemType === "Windows") {
          setIsCompatible(true);
        } else {
          setIsCompatible(false);
        }
      } catch (err) {
        console.log("Error detecting system:", err);
        setIsCompatible(false);
      } finally {
        setCheckingCompatibility(false);
      }
    };

    checkSystemCompatibility();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!passphrase || !confirmPassphrase) {
      setError(t.auth.pleaseCompleteAllFields);
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setError(t.auth.passwordsDoNotMatch);
      return;
    }
    setLoading(true);
    try {
      await invoke("store_passphrase_cmd", { passphrase });
      await invoke("write_setting_cmd", { key: "first_access" , value: "1" })
      setSuccess(t.auth.masterPasswordSaved);
      setPassphrase("");
      setConfirmPassphrase("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err && err.toString ? err.toString() : t.auth.errorSavingPassword);
    } finally {
      setLoading(false);
    }
  };

  if (checkingCompatibility) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-zinc-900">
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28 mb-1 flex-shrink-0">
            <img src="/icon_termo.webp" alt="icon" className="w-25 h-25 object-contain" />
            <div className="absolute inset-0 bg-zinc-900 opacity-50 rounded" />
          </div>
          <span className="text-2xl font-bold text-zinc-500 text-shadow-zinc-500 font-sans mb-4" style={{ letterSpacing: 1 }}>
            Termo
          </span>
          <p className="text-zinc-400">{t.welcome.checkingCompatibility}</p>
        </div>
      </div>
    );
  }

  if (isCompatible === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-zinc-900">
        <div className="flex flex-col items-center max-w-md p-8 text-center">
          <div className="relative w-28 h-28 mb-1 flex-shrink-0">
            <img src="/icon_termo.webp" alt="icon" className="w-25 h-25 object-contain opacity-50" />
            <div className="absolute inset-0 bg-zinc-900 opacity-50 rounded" />
          </div>
          <span className="text-2xl font-bold text-zinc-500 text-shadow-zinc-500 font-sans mb-6" style={{ letterSpacing: 1 }}>
            Termo
          </span>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-red-500 mb-4">{t.welcome.systemNotCompatible}</h2>
            <p className="text-zinc-400 leading-relaxed">
              {t.welcome.sorryNotCompatible}
            </p>
          </div>
          <button
            onClick={() => window.close()}
            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded transition"
          >
            {t.welcome.closeApplication}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-zinc-900 pb-20 pt-10">
      <div className="flex flex-col items-center w-full max-w-md p-8 rounded-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-28 h-28 mb-1 flex-shrink-0">
            <img src="/icon_termo.webp" alt="icon" className="w-25 h-25 object-contain" />
            <div className="absolute inset-0 bg-zinc-900 opacity-50 rounded" />
          </div>
          <span className="text-2xl font-bold text-zinc-500 text-shadow-zinc-500 font-sans" style={{ letterSpacing: 1 }}>
            Termo
          </span>
        </div>
        <div className="text-center mb-8">
          <p className="text text-zinc-400 font-medium mb-2">
            {t.welcome.needMasterPassword}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <input
            type="password"
            className="mb-3 w-full rounded h-10 px-3 border border-zinc-700 bg-zinc-800 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            placeholder={t.welcome.introduceMasterPassword}
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            autoComplete="new-password"
          />
          <input
            type="password"
            className="mb-4 w-full rounded h-10 px-3 border border-zinc-700 bg-zinc-800 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            placeholder={t.auth.confirmPassword}
            value={confirmPassphrase}
            onChange={e => setConfirmPassphrase(e.target.value)}
            autoComplete="new-password"
          />
          {error && <div className="mb-2 text-red-500 text-sm">{error}</div>}
          {success && <div className="mb-2 text-green-500 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full h-10 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? t.auth.saving : t.auth.saveMasterPassword}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomePage;
