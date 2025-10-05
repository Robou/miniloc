import React from 'react';
import { useToken } from '../../contexts/TokenContext';

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
  const { isTokenValid } = useToken();

  // Filtrer les onglets en fonction du token
  const filteredTabs = tabs.filter((tab) => {
    // Toujours afficher Catalogue, Emprunts et Admin
    if (tab.id === 'catalogue' || tab.id === 'borrows' || tab.id === 'login') {
      return true;
    }
    // Masquer seulement Panier si token invalide
    if (tab.id === 'cart') {
      return isTokenValid;
    }
    return true;
  });

  return (
    <div className="nav-tabs mb-6 flex flex-wrap">
      {filteredTabs.map((tab) => (
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
