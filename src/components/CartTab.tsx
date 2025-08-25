import React from 'react';
import { Article, Book } from '../types/AppMode.tsx';
import { Button } from './ui/Button.tsx';

interface CartTabProps {
  cart: (Article | Book)[];
  onRemoveFromCart: (itemId: number) => void;
  onClearCart: () => void;
  onProceedToBorrow: () => void;
  onGoToCatalogue: () => void;
  currentMode: 'articles' | 'books';
}

const CartTab: React.FC<CartTabProps> = ({
  cart,
  onRemoveFromCart,
  onClearCart,
  onProceedToBorrow,
  onGoToCatalogue,
  currentMode,
}) => {
  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">
            <i className="fas fa-shopping-cart mr-2"></i>
            Votre Panier
          </h2>
        </div>
        <div className="card-body">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg">Votre panier est vide</p>
              <Button onClick={onGoToCatalogue} className="mt-4 btn-primary">
                <i className="fas fa-list mr-2"></i>
                Parcourir le catalogue
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {currentMode === 'articles'
                          ? (item as Article).designation || 'Article'
                          : (item as Book).title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-tag mr-1"></i>
                        {currentMode === 'articles'
                          ? (item as Article).type
                          : (item as Book).category}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveFromCart(item.id)}
                      className="btn-outline"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Retirer
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={onProceedToBorrow} className="btn-primary flex-1">
                  <i className="fas fa-check-circle mr-2"></i>
                  Procéder à l'emprunt
                </Button>
                <Button variant="outline" onClick={onClearCart} className="btn-outline">
                  <i className="fas fa-trash mr-2"></i>
                  Vider le panier
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartTab;
