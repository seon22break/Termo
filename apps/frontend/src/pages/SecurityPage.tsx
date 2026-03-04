import React, { useRef, useState, useEffect } from "react";
import { useI18n } from "../context/I18nContext";

interface SecurityPageProps {
  onSubmit: (passphrase: string) => void;
  error?: string;
  attempts?: number;
  locked?: boolean;
}

const SecurityPage: React.FC<SecurityPageProps> = ({ 
  onSubmit, 
  error, 
  attempts = 0, 
  locked = false 
}) => {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [passphrase, setPassphrase] = useState("");

  useEffect(() => {
    if (inputRef.current && !locked) {
      inputRef.current.focus();
    }
  }, [locked]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (locked) return;
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (locked) return;
    if (passphrase.trim().length > 0) {
      onSubmit(passphrase);
    }
  };

  return (
    <div className="flex h-full w-full bg-zinc-900 items-center justify-center">
      <div className="flex flex-col items-center space-y-6 p-8 max-w-md w-full">
        <div className="flex justify-center">
          <img 
            src="/icon_termo.webp" 
            alt="Termo" 
            className="w-24 h-24 object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-white text-center">
          {t.app.name}
        </h1>

        <p className="text-gray-300 text-center text-lg leading-relaxed">
          {t.auth.enterMasterPassword}
        </p>

        <div className="w-full space-y-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              className="flex-1 text-base p-3 outline-none text-white rounded-lg bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder={t.auth.masterPassword}
              type="password"
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={locked}
            />
            <button
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded transition disabled:opacity-50"
              onClick={handleSubmit}
              disabled={passphrase.trim().length === 0 || locked}
            >
              {t.auth.send}
            </button>
          </div>

          {error && !locked && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800/30 rounded-lg p-3">
              {error}
              {attempts > 0 && (
                <span className="block mt-1 text-red-300">
                  {t.auth.attempts}: {attempts}/3
                </span>
              )}
            </div>
          )}

          {locked && (
            <div className="text-yellow-400 text-sm text-center bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-3">
              {t.auth.tooManyAttempts}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;