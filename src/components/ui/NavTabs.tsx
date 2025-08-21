import React from 'react';

interface NavTab {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
  badge?: string;
}

interface NavTabsProps {
  tabs: NavTab[];
  //currentStep: string;
}

const NavTabs: React.FC<NavTabsProps> = ({ tabs }) => {
  // = ({ tabs, currentStep }) => {
  return (
    <div className="nav-tabs flex flex-wrap mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab ${tab.isActive ? 'active' : ''}`}
          onClick={tab.onClick}
        >
          <i className={`${tab.icon} mr-2`}></i>
          {tab.label}
          {tab.badge && ` (${tab.badge})`}
        </button>
      ))}
    </div>
  );
};

export default NavTabs;
