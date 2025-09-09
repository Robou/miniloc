import React from 'react';
import { AppMode, MODE_CONFIGS } from '../../types/AppMode';

interface ModeSelectorProps {
  currentMode: AppMode;
  cart: unknown[];
  setCurrentMode: (mode: AppMode) => void;
  showModeLockedToast: boolean;
  setShowModeLockedToast: (show: boolean) => void;
  enabledModes: AppMode[]; // Maintenant requis puisqu'on l'affiche seulement avec plusieurs modes
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  cart,
  setCurrentMode,
  showModeLockedToast,
  setShowModeLockedToast,
  enabledModes,
}) => {
  const isModeLockedByCart = cart.length > 0;

  // Les modes sont déjà filtrés au niveau App.tsx
  const availableModes = Object.entries(MODE_CONFIGS).filter(([mode]) =>
    enabledModes.includes(mode as AppMode)
  );

  return (
    <div className="mb-6 flex flex-col items-center">
      <div className="flex rounded-lg border bg-white p-1 shadow-sm">
        {availableModes.map(([mode, config]) => (
          <button
            key={mode}
            onClick={() => {
              if (isModeLockedByCart && mode !== currentMode) {
                setShowModeLockedToast(true);
                setTimeout(() => setShowModeLockedToast(false), 3000);
              } else {
                setCurrentMode(mode as AppMode);
              }
            }}
            className={`rounded-md px-4 py-2 transition-colors ${
              currentMode === mode
                ? 'bg-blue-500 text-white'
                : isModeLockedByCart && mode !== currentMode
                  ? 'cursor-not-allowed bg-gray-50 text-gray-400'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className={`${config.icon} mr-2`}></i>
            {config.name}
          </button>
        ))}
      </div>
      {/* Toast de verrouillage du mode */}
      {showModeLockedToast && (
        <div className="mt-3 animate-pulse rounded-lg border border-orange-400 bg-orange-100 px-4 py-3 text-orange-700 shadow-sm">
          <div className="flex items-center">
            <i className="fas fa-lock mr-2"></i>
            <span className="text-sm">
              Impossible de changer de mode : videz d'abord votre panier pour éviter de mélanger les
              emprunts
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeSelector;
