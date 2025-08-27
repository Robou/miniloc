import { AppMode, MODE_CONFIGS } from '@/types/AppMode';
import * as React from 'react';

interface HeaderProps {
  currentMode: AppMode;
}

const Header: React.FC<HeaderProps> = ({ currentMode }) => {
  const currentConfig = MODE_CONFIGS[currentMode];

  return (
    <div className="app-header text-center">
      <h1 className="text-4xl font-bold mb-2">
        <i className={`${currentConfig.icon} mr-3`}></i>
        CAF Avignon - {currentConfig.name}
      </h1>
      <p className="lead text-lg text-gray-600">
        Consultez et empruntez{' '}
        {currentMode === 'articles' ? 'le matériel de montagne' : 'les livres'} du club
      </p>
    </div>
  );
};

export default Header;
