import React from 'react';
import { useI18n } from '../../context/I18nContext';
import SidebarRight01Icon from "../../assets/Icons/sidebar-right-01-stroke-rounded";

interface HiddenSidebarProps {
  onShowSidebar: () => void;
  style?: React.CSSProperties;
}

const HiddenSidebar: React.FC<HiddenSidebarProps> = ({ onShowSidebar, style }) => {
  const { t } = useI18n();
  
  return (
    <aside
      className="bg-zinc-900 flex flex-col items-center justify-start h-full border-r border-[#1a1a1a] transition-all duration-300"
      style={style}
    >
      <button
        className="bg-none border-none text-white text-2xl mt-3 cursor-pointer"
        title={t.sidebar.showSidebar}
        onClick={onShowSidebar}
      >
        <SidebarRight01Icon width={18} height={18} color="#fff" />
      </button>
    </aside>
  );
};

export default HiddenSidebar;
