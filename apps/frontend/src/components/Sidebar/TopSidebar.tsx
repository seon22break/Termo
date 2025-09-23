import React from 'react';
import { useI18n } from '../../context/I18nContext';
import SidebarLeft01Icon from "../../assets/Icons/sidebar-left-01-stroke-rounded";
import AddCircleIcon from "../../assets/Icons/add-circle-stroke-rounded";

interface TopSidebarProps {
  onCreateConnection: () => void;
  onHideSidebar: () => void;
}

const TopSidebar: React.FC<TopSidebarProps> = ({ onCreateConnection, onHideSidebar }) => {
  const { t } = useI18n();
  
  return (
    <>
      <div className="flex items-center">
        <button
          className="flex-1 bg-zinc-900 flex items-center gap-3 rounded-lg px-4 py-3 text-base text-left text-white font-normal shadow-sm mr-2 transition hover:bg-zinc-800 cursor-pointer"
          onClick={onCreateConnection}
        >
          <AddCircleIcon width={18} height={18} color='#fff' />
          <span>{t.sidebar.createConnection}</span>
        </button>
        <button
          className="bg-none border-none text-white text-2xl w-8 h-8 flex items-center justify-center cursor-pointer"
          title={t.sidebar.hideSidebar}
          onClick={onHideSidebar}
        >
          <SidebarLeft01Icon width={18} height={18} color="#fff" />
        </button>
      </div>
      <hr className="border-l-100 border-zinc-50" />
    </>
  );
};

export default TopSidebar;
