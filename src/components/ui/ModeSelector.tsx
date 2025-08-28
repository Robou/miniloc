import React from 'react';
import { AppMode, MODE_CONFIGS } from '../../types/AppMode';

interface ModeSelectorProps {
  currentMode: AppMode;
  cart: unknown[];
  setCurrentMode: (mode: AppMode) => void;
  showModeLockedToast: boolean;
  setShowModeLockedToast: (show: boolean) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  cart,
  setCurrentMode,
  showModeLockedToast,
  setShowModeLockedToast,
}) => {
  const isModeLockedByCart = cart.length > 0;

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="bg-white rounded-lg shadow-sm border p-1 flex">
        {Object.entries(MODE_CONFIGS).map(([mode, config]) => (
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
            className={`px-4 py-2 rounded-md transition-colors ${
              currentMode === mode
                ? 'bg-blue-500 text-white'
                : isModeLockedByCart && mode !== currentMode
                  ? 'text-gray-400 cursor-not-allowed bg-gray-50'
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
        <div className="mt-3 bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded-lg shadow-sm animate-pulse">
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
