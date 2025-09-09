import React, { useState } from 'react';
import { Article, Book, AppMode } from '../types/AppMode';
//import ItemForm from './ItemForm';
import AdaptiveItemForm from './ItemForm';
import BatchImportComponent from './BatchImportComponent';
import AdminModeController from './AdminModeController';
import Catalog from './CatalogTab';

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

  const handleFormSubmit = (itemData: Partial<Article | Book>) => {
    if (editingItem) {
      onEditItem(itemData);
      setEditingItem(null);
    } else {
      onAddItem(itemData);
    }
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
