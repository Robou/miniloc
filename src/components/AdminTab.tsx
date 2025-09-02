import React from 'react';
import { Article, Book } from '../types/AppMode';
//import ItemForm from './ItemForm';
import AdaptiveItemForm from './ItemForm';

interface AdminTabProps {
  items: (Article | Book)[];
  onAddItem: (itemData: Partial<Article | Book>) => void;
  currentMode: 'articles' | 'books';
  currentConfigName: string;
}

/* */
/* TEST */
/* */

//const [itemType, setItemType] = React.useState('product');

// const handleFormSubmit = (data) => {
//   console.log('Données soumises:', { type: itemType, ...data });
//   alert(`${itemType} créé avec succès !`);
//   // Ici vous pouvez faire l'appel API
// };

// return (
//   <div className="p-8">
//     <div className="mb-6 text-center">
//       <button
//         onClick={() => setItemType('product')}
//         className={`mr-4 px-4 py-2 rounded ${
//           itemType === 'product' ? 'bg-blue-500 text-white' : 'bg-gray-200'
//         }`}
//       >
//         Produit
//       </button>
//       <button
//         onClick={() => setItemType('service')}
//         className={`px-4 py-2 rounded ${
//           itemType === 'service' ? 'bg-blue-500 text-white' : 'bg-gray-200'
//         }`}
//       >
//         Service
//       </button>
//     </div>

//     <AdaptiveItemForm itemType={itemType} onSubmit={handleFormSubmit} />
//   </div>
// );

/* */
/* FIN TEST */
/* */

const AdminTab: React.FC<AdminTabProps> = ({
  items,
  onAddItem,
  currentMode,
  currentConfigName,
}) => {
  const handleFormSubmit = (itemData: Partial<Article | Book>) => {
    onAddItem(itemData);
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
          {/* <ItemForm onAdd={onAddItem} currentMode={currentMode} /> */}
          <AdaptiveItemForm currentMode={currentMode} onSubmit={handleFormSubmit} />

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">{currentConfigName} existants</h3>
            <div className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTab;
