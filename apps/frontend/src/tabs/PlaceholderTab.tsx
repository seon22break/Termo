import type { ReactNode } from "react";
import { useI18n } from "../context/I18nContext";

interface PlaceholderTabProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
}

const PlaceholderTab = ({
  title = "",
  subtitle = "",
  icon
}: PlaceholderTabProps) => {
  const { t } = useI18n();

  const displayTitle = title || t.placeholder.appName;
  const displaySubtitle = subtitle || t.placeholder.tagline;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-900 p-8">
      <div className="text-center max-w-2xl mx-auto space-y-8">

        <div className="relative w-28 h-28 mx-auto">
          {icon || (
            <>
              <img
                src="/icon_termo.webp"
                alt="Termo"
                className="w-28 h-28 object-contain opacity-90"
              />
              <div className="absolute inset-0 bg-zinc-900 opacity-50 rounded" />
            </>
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-6xl font-bold text-zinc-500 font-sans tracking-wide">
            {displayTitle}
          </h1>
          <h2 className="text-2xl text-zinc-700 font-medium">
            {displaySubtitle}
          </h2>
        </div>

        <div className="text-sm text-zinc-700 space-y-1 max-w-md mx-auto">
          <p className="flex items-center justify-center gap-1">
            <span>💡</span>
            <span>{t.placeholder.tip1}</span>
          </p>
          <p className="flex items-center justify-center gap-1">
            <span>⌨️</span>
            <span>
              {t.placeholder.tip2.split('{key}')[0]}
              <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-400 font-mono text-xs">Ctrl+P</kbd>
              {t.placeholder.tip2.split('{key}')[1]}
            </span>
          </p>
          <p className="flex items-center justify-center gap-1">
            <span>🔗</span>
            <span>{t.terminal.doubleClickToOpen}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderTab;