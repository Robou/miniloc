import * as React from 'react';
import { Button } from './button';
import { Article, Book } from '@/types/AppMode';

interface ItemCardProps {
  item: Article | Book;
  isInCart: boolean;
  onAddToCart: (item: Article | Book) => void;
  currentMode: 'articles' | 'books';
}

const ItemCard: React.FunctionComponent<ItemCardProps> = ({
  item,
  isInCart,
  onAddToCart,
  currentMode,
}) => {
  const itemType = currentMode === 'articles' ? (item as Article).type : (item as Book).category;
  const typeClass = `type-${itemType?.toLowerCase().replace(/\s+/g, '-') || 'default'}`;

  const displayName =
    currentMode === 'articles'
      ? (item as Article).designation || (item as Article).name || 'Article'
      : (item as Book).title;

  return (
    <div key={item.id} id={`item-${item.id}`} className={`card article-card ${typeClass} fade-in`}>
      <div className="card-body">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-gray-800 flex-1">{displayName}</h3>
          <div className="ml-2">
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

        <div className="mb-4">
          <span className="badge badge-secondary">
            <i className="fas fa-tag mr-1"></i>
            {itemType || 'Non spécifié'}
          </span>
        </div>

        <Button
          onClick={() => onAddToCart(item)}
          disabled={!item.available || isInCart}
          className={`w-full ${
            !item.available ? 'btn-unavailable' : isInCart ? 'btn-added' : 'btn-primary'
          }`}
        >
          <i
            className={`fas ${!item.available ? 'fa-ban' : isInCart ? 'fa-check' : 'fa-plus'} mr-2`}
          ></i>
          {!item.available ? 'Indisponible' : isInCart ? 'Ajouté au panier' : 'Ajouter au panier'}
        </Button>
      </div>
    </div>
  );
};

export default ItemCard;
