import React from 'react';
import { Article, Book } from '../types/AppMode.tsx';
import ItemCard from './ui/ItemCard.tsx';
import SearchBar from './ui/SearchBar.tsx';

interface CatalogProps {
  items: (Article | Book)[];
  search: string;
  onSearchChange: (value: string) => void;
  cart: (Article | Book)[];
  onAddToCart: (item: Article | Book) => void;
  currentMode: 'articles' | 'books';
}

const Catalog: React.FC<CatalogProps> = ({
  items,
  search,
  onSearchChange,
  cart,
  onAddToCart,
  currentMode,
}) => {
  const filteredItems = items.filter((item) => {
    const searchField =
      currentMode === 'articles'
        ? (item as Article).designation || (item as Article).name || ''
        : (item as Book).title || '';
    return searchField.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="fade-in">
      <SearchBar
        search={search}
        onSearchChange={onSearchChange}
        placeholder={`Rechercher un ${currentMode === 'articles' ? 'article' : 'livre'}...`}
      />

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isInCart = !!cart.find((a) => a.id === item.id);
            return (
              <ItemCard
                key={item.id}
                item={item}
                isInCart={isInCart}
                onAddToCart={onAddToCart}
                currentMode={currentMode}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">
            Aucun {currentMode === 'articles' ? 'article' : 'livre'} trouvé
          </p>
        </div>
      )}
    </div>
  );
};

export default Catalog;
