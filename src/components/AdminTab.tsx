import React, { useState } from 'react';
import { Article, Book, AppMode } from '../types/AppMode';
//import ItemForm from './ItemForm';
import AdaptiveItemForm from './ItemForm';
import BatchImportComponent from './BatchImportComponent';
import AdminModeController from './AdminModeController';
import Catalog from './CatalogTab';
import { authorizeClubComputer, deauthorizeClubComputer, getLocalToken } from '../utils/tokenUtils';
import { Button } from './ui/Button';

interface AdminTabProps {
  items: (Article | Book)[];
  onAddItem: (itemData: Partial<Article | Book>) => void;
  onEditItem: (itemData: Partial<Article | Book>) => void;
  currentMode: 'articles' | 'books';
  currentConfigName: string;
  enabledModes: AppMode[];
  onEnabledModesChange: (modes: AppMode[]) => void;
  search: string; // Ajouter cette prop
  onSearchChange: (value: string) => void; // pour Catalog
  cart: (Article | Book)[]; // pour Catalog
  onAddToCart: (item: Article | Book) => void; // pour Catalog
}

const AdminTab: React.FC<AdminTabProps> = ({
  items,
  onAddItem,
  onEditItem,
  currentMode,
  currentConfigName,
  enabledModes,
  onEnabledModesChange,
  search,
  onSearchChange,
  cart,
  onAddToCart,
}) => {
  const [editingItem, setEditingItem] = useState<Article | Book | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isDeauthorizing, setIsDeauthorizing] = useState(false);

  // Vérifier si l'ordinateur est actuellement autorisé
  const isComputerAuthorized = !!getLocalToken();

  const handleFormSubmit = (itemData: Partial<Article | Book>) => {
    if (editingItem) {
      onEditItem(itemData);
      setEditingItem(null);
    } else {
      onAddItem(itemData);
    }
  };

  const handleAuthorizeComputer = async () => {
    setIsAuthorizing(true);
    try {
      const success = await authorizeClubComputer();
      if (success) {
        // Recharger la page pour appliquer les changements
        window.location.reload();
      }
    } catch (error) {
      console.error("Erreur lors de l'autorisation:", error);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleDeauthorizeComputer = () => {
    setIsDeauthorizing(true);
    deauthorizeClubComputer();
    // Recharger la page pour appliquer les changements
    setTimeout(() => {
      window.location.reload();
    }, 500);
    setIsDeauthorizing(false);
  };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">
            <i className="fas fa-cogs mr-2"></i>
            Espace Administrateur
          </h2>
        </div>

        <div className="card-body">
          {/* Section de gestion du token club */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="mb-4 text-lg font-semibold">
              <i className="fas fa-key mr-2"></i>
              Autorisation de l'ordinateur du club
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Cette fonctionnalité permet de déclarer que ce navigateur est l'ordinateur autorisé du
              club. Une fois autorisé, les fonctionnalités d'emprunt seront activées pour tous les
              utilisateurs.
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center ${isComputerAuthorized ? 'text-green-600' : 'text-red-600'}`}
                >
                  <i
                    className={`fas ${isComputerAuthorized ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}
                  ></i>
                  <span className="text-sm font-medium">
                    {isComputerAuthorized ? 'Ordinateur autorisé' : 'Ordinateur non autorisé'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                {!isComputerAuthorized ? (
                  <Button
                    onClick={handleAuthorizeComputer}
                    disabled={isAuthorizing}
                    className="btn-success"
                  >
                    <i
                      className={`fas ${isAuthorizing ? 'fa-spinner fa-spin' : 'fa-key'} mr-2`}
                    ></i>
                    {isAuthorizing ? 'Autorisation...' : 'Autoriser cet ordinateur'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleDeauthorizeComputer}
                    disabled={isDeauthorizing}
                    className="btn-danger"
                  >
                    <i
                      className={`fas ${isDeauthorizing ? 'fa-spinner fa-spin' : 'fa-ban'} mr-2`}
                    ></i>
                    {isDeauthorizing ? 'Désautorisation...' : 'Désautoriser cet ordinateur'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <AdminModeController
            enabledModes={enabledModes}
            onEnabledModesChange={onEnabledModesChange}
          />

          {/* <ItemForm onAdd={onAddItem} currentMode={currentMode} /> */}
          <AdaptiveItemForm
            currentMode={currentMode}
            onSubmit={handleFormSubmit}
            initialData={editingItem || {}}
          />

          <BatchImportComponent mode={currentMode === 'articles' ? 'equipment' : currentMode} />

          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold">{currentConfigName} existants</h3>
            <div className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {currentMode === 'articles'
                        ? (item as Article).designation || 'Article'
                        : (item as Book).title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {currentMode === 'articles'
                        ? (item as Article).type
                        : (item as Book).category}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.available ? (
                      <span className="badge badge-success">
                        <i className="fas fa-check mr-1"></i>
                        Disponible
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        <i className="fas fa-times mr-1"></i>
                        Emprunté
                      </span>
                    )}
                    <button
                      onClick={() => setEditingItem(item)}
                      className="btn btn-secondary btn-sm"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Éditer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Catalog
            items={items}
            search={search}
            onSearchChange={onSearchChange}
            cart={cart}
            onAddToCart={onAddToCart}
            currentMode={currentMode}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminTab;
