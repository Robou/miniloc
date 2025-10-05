import { AppMode, MODE_CONFIGS } from '@/types/AppMode';
import * as React from 'react';
import { useToken } from '../../contexts/TokenContext';

interface HeaderProps {
  currentMode: AppMode;
}

const Header: React.FC<HeaderProps> = ({ currentMode }) => {
  const { isTokenValid } = useToken();
  const currentConfig = MODE_CONFIGS[currentMode];

  return (
    <div className="app-header text-center">
      <h1 className="mb-2 text-4xl font-bold">
        <i className={`${currentConfig.icon} mr-3`}></i>
        Miniloc - {currentConfig.name}
      </h1>
      <p className="lead text-lg text-gray-600">
        Consultez et empruntez{' '}
        {currentMode === 'articles' ? 'le matériel de montagne' : 'les livres'} du club
      </p>

      {/* Message d'avertissement si token invalide */}
      {!isTokenValid && (
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-left">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-triangle text-yellow-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Accès restreint aux emprunts</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Les fonctionnalités d'emprunt sont désactivées car vous n'êtes pas sur
                  l'ordinateur autorisé du club. Veuillez contacter un administrateur du club pour
                  obtenir l'accès.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
