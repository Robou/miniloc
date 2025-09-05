import React from 'react';
import { Article, Book } from '../types/AppMode';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface BorrowerInfo {
  name: string;
  email: string;
  rental_price: string;
  supervisor_name: string;
}

interface BorrowFormTabProps {
  cart: (Article | Book)[];
  borrower: BorrowerInfo;
  onBorrowerChange: (field: keyof BorrowerInfo, value: string) => void;
  onConfirmBorrow: () => void;
  onBackToCart: () => void;
  currentMode: 'articles' | 'books';
}

const BorrowFormTab: React.FC<BorrowFormTabProps> = ({
  cart,
  borrower,
  onBorrowerChange,
  onConfirmBorrow,
  onBackToCart,
  currentMode,
}) => {
  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">
            <i className="fas fa-hand-holding mr-2"></i>
            Finaliser l'emprunt
          </h2>
        </div>
        <div className="card-body">
          <div className="mb-6">
            <h3 className="mb-3 font-semibold">Articles à emprunter :</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center rounded-lg bg-blue-50 p-3">
                  <i className="fas fa-check-circle mr-3 text-blue-500"></i>
                  <span className="font-medium">
                    {currentMode === 'articles'
                      ? (item as Article).designation || 'Article'
                      : (item as Book).title}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    ({currentMode === 'articles' ? (item as Article).type : (item as Book).category}
                    )
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <i className="fas fa-user mr-1"></i>
                Votre nom *
              </label>
              <Input
                placeholder="Entrez votre nom complet"
                value={borrower.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onBorrowerChange('name', e.target.value)
                }
                className="form-control"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <i className="fas fa-envelope mr-1"></i>
                Votre email (facultatif)
              </label>
              <Input
                placeholder="votre.email@exemple.com"
                value={borrower.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onBorrowerChange('email', e.target.value)
                }
                className="form-control"
                type="email"
              />
            </div>

            {/* Champs spécifiques au matériel de montagne */}
            {currentMode === 'articles' && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <i className="fas fa-euro-sign mr-1"></i>
                    Prix d'emprunt (facultatif)
                  </label>
                  <Input
                    placeholder="0.00"
                    value={borrower.rental_price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onBorrowerChange('rental_price', e.target.value)
                    }
                    className="form-control"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <i className="fas fa-user-tie mr-1"></i>
                    Nom de l'encadrant (facultatif)
                  </label>
                  <Input
                    placeholder="Nom de l'encadrant pour la sortie"
                    value={borrower.supervisor_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onBorrowerChange('supervisor_name', e.target.value)
                    }
                    className="form-control"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button
                onClick={onConfirmBorrow}
                className="btn-primary flex-1"
                disabled={!borrower.name}
              >
                <i className="fas fa-check-circle mr-2"></i>
                Confirmer l'emprunt
              </Button>
              <Button variant="outline" onClick={onBackToCart} className="btn-outline">
                <i className="fas fa-arrow-left mr-2"></i>
                Retour au panier
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowFormTab;
