import React from 'react';
import { useTabActions } from '../../hooks/useTabActions';
import { useI18n } from '../../context/I18nContext';
import SettingsIcon from '../../assets/Icons/settings-stroke-rounded';

interface BottomSidebarProps {
  isHidden?: boolean;
}

const BottomSidebar: React.FC<BottomSidebarProps> = ({ isHidden = false }) => {
  const { openSettingsTab } = useTabActions();
  const { t } = useI18n();


  const handleOpenSettings = () => {
    openSettingsTab();
  };

  if (isHidden) {
    return (
      <div className="p-2">
        <button
          onClick={handleOpenSettings}
          className="w-full p-2 text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center"
          title={t.sidebar.settings}
        >
          <SettingsIcon width={18} height={18} color="#fff" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleOpenSettings}
        className="w-full bg-zinc-900 flex items-center gap-3 rounded-lg px-4 py-3 text-base text-left text-white font-normal shadow-sm transition hover:bg-zinc-800 cursor-pointer"
      >
        <SettingsIcon width={18} height={18} color="#fff" />
        <span>{t.sidebar.settings}</span>
      </button>
    </div>
  );
};

export default BottomSidebar;
