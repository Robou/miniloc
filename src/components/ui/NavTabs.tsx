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
}

const NavTabs: React.FC<NavTabsProps> = ({ tabs }) => {
  return (
    <div className="nav-tabs mb-6 flex flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab ${tab.isActive ? 'active' : ''} ${tab.label === 'Admin' ? 'ml-auto' : ''}`}
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
