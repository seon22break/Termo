import React from "react";
import { useI18n } from "../../context/I18nContext";

interface SessionNavProps {
  titulo: string;
  onClose: () => void;
  active: boolean;
  onClick: () => void;
}

const SessionNav: React.FC<SessionNavProps> = ({
  titulo,
  onClose,
  active,
  onClick,
}) => {
  const { t } = useI18n();
  const title = titulo || "Sin título";
  const mostrarTitulo =
    title.length > 20 ? title.slice(0, 20) + "..." : title;

  return (
    <nav
      onClick={onClick}
      className={`flex items-center select-none min-w-[120px] max-w-[220px] overflow-hidden cursor-pointer relative duration-200 px-[18px] rounded-t-lg border border-zinc-900 ${
        active
          ? "bg-black text-white border-t-4 border-t-[#3390ff] border-b-0 h-[44px]"
          : "bg-zinc-900 text-[#c7c7c7] border-t-4 border-t-transparent border-b-0 h-9"
      }`}
      style={{ minHeight: '100%' }}
    >
      <span className="flex-1 font-medium text-[15px] whitespace-nowrap overflow-hidden text-ellipsis">
        {mostrarTitulo}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="session-nav-close ml-2 bg-transparent border-none text-[#c7c7c7] text-base font-bold px-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative"
        aria-label={t.navigation.closeTab}
        tabIndex={-1}
      >
        ×
      </button>
      <style>{`
        nav:hover .session-nav-close {
          opacity: 1;
        }
      `}</style>
    </nav>
  );
};

export default SessionNav;
