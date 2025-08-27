import React from 'react';
import { ArticleBorrow, BookBorrow } from '../types/AppMode';
import { Button } from './ui/Button';

interface BorrowsTabProps {
  borrows: (ArticleBorrow | BookBorrow)[];
  onReturnItem: (borrowId: number) => void;
  currentMode: 'articles' | 'books';
}

const BorrowsTab: React.FC<BorrowsTabProps> = ({ borrows, onReturnItem, currentMode }) => {
  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">
            <i className="fas fa-hand-holding mr-2"></i>
            Emprunts en cours
          </h2>
        </div>
        <div className="card-body">
          {borrows.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-hand-holding text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg">Aucun emprunt en cours</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {borrows.map((borrow) => (
                <div key={borrow.id} className="card">
                  <div className="card-body">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 mb-4 sm:mb-0">
                        <h4 className="font-bold text-lg text-gray-800">
                          {currentMode === 'articles'
                            ? (borrow as ArticleBorrow).equipment?.designation ||
                              `Article ID: ${(borrow as ArticleBorrow).equipment_id}`
                            : (borrow as BookBorrow).book?.title ||
                              `Livre ID: ${(borrow as BookBorrow).book_id}`}
                        </h4>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-tag mr-2"></i>
                            Type:{' '}
                            {currentMode === 'articles'
                              ? (borrow as ArticleBorrow).equipment?.type || 'Type inconnu'
                              : (borrow as BookBorrow).book?.category || 'Catégorie inconnue'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-user mr-2"></i>
                            Emprunté par: <span className="font-medium">{borrow.name}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-envelope mr-2"></i>
                            Contact: {borrow.email || 'Non renseigné'}
                          </p>
                          <p className="text-sm text-gray-500">
                            <i className="fas fa-calendar mr-2"></i>
                            Date: {new Date(borrow.borrowed_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => onReturnItem(borrow.id)} className="btn-success">
                        <i className="fas fa-undo mr-2"></i>
                        Retourner
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowsTab;
