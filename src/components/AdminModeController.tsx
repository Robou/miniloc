import React, { useState } from 'react';
import { AppMode, MODE_CONFIGS } from '../types/AppMode';

interface AdminModeControllerProps {
  enabledModes: AppMode[];
  onEnabledModesChange: (modes: AppMode[]) => void;
}

const AdminModeController: React.FC<AdminModeControllerProps> = ({
  enabledModes,
  onEnabledModesChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleModeToggle = (mode: AppMode) => {
    const newEnabledModes = enabledModes.includes(mode)
      ? enabledModes.filter((m) => m !== mode)
      : [...enabledModes, mode];
    onEnabledModesChange(newEnabledModes);
  };

  const handleSelectAll = () => {
    onEnabledModesChange(['articles', 'books']);
  };

  const handleSelectNone = () => {
    onEnabledModesChange([]);
  };

  return (
    <div className="mb-6 rounded-lg border border-gray-400 bg-gray-50 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-sm font-medium text-gray-700">
          <i className="fas fa-cogs mr-2"></i>
          Configuration des modes disponibles
        </h3>
        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-500`}></i>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="rounded bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200"
            >
              Tout sélectionner
            </button>
            <button
              onClick={handleSelectNone}
              className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
            >
              Tout désélectionner
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(MODE_CONFIGS).map(([mode, config]) => (
              <label key={mode} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={enabledModes.includes(mode as AppMode)}
                  onChange={() => handleModeToggle(mode as AppMode)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <i className={`${config.icon} text-gray-600`}></i>
                <span className="text-sm text-gray-700">{config.name}</span>
              </label>
            ))}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            <i className="fas fa-info-circle mr-1"></i>
            Désactivez un mode pour les clubs qui n'utilisent pas cette fonctionnalité
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModeController;
