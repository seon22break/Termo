import React from 'react';
import { useApp } from "../../context/AppContext";
import SessionNav from './SessionNav';

const Navbar: React.FC = () => {
  const { openTabs, activeTab, setActiveTab, closeTab } = useApp();

  return (
    <div className="flex flex-row items-center gap-0 overflow-x-auto w-full bg-zinc-900 border-none min-h-[44px] max-h-[44px] navbar-scroll scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-[#222]">
      {openTabs.map((tab) => (
        <SessionNav
          key={tab}
          titulo={tab}
          active={activeTab === tab}
          onClick={() => setActiveTab(tab)}
          onClose={() => closeTab(tab)}
        />
      ))}
    </div>
  );
};

export default Navbar;
