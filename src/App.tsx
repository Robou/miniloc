import { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import supabase from './lib/supabase';
import { addToCart, clearCart, removeFromCart } from './utils/cartUtils';
import { confirmBorrow, returnItem } from './utils/borrowUtils';
import { handleLogin } from './utils/authUtils';
import { addItem } from './utils/itemUtils';

import { AppMode, Article, Book, BookBorrow, ArticleBorrow, MODE_CONFIGS } from './types/AppMode';
import NavTabs from './components/ui/NavTabs';
import Catalog from './components/CatalogTab';
import CartTab from './components/CartTab';
import BorrowFormTab from './components/BorrowFormTab';
import BorrowsTab from './components/BorrowsTab';
import LoginTab from './components/LoginTab';
import AdminTab from './components/AdminTab';

export default function App() {
  const newLocal = useState<AppMode>('articles');
  const [currentMode, setCurrentMode] = newLocal;
  const [articles, setArticles] = useState<Article[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Article[] | Book[]>([]);
  const [step, setStep] = useState<'catalogue' | 'cart' | 'borrow' | 'login' | 'admin' | 'borrows'>(
    'catalogue'
  );
  const [borrower, setBorrower] = useState({
    name: '',
    email: '',
    rental_price: '',
    supervisor_name: '',
  });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [borrows, setBorrows] = useState<ArticleBorrow[] | BookBorrow[]>([]);
  const [showModeLockedToast, setShowModeLockedToast] = useState(false);

  const currentConfig = MODE_CONFIGS[currentMode];
  const currentItems = currentMode === 'articles' ? articles : books;
  const isModeLockedByCart = cart.length > 0;

  const fetchArticles = useCallback(async () => {
    const { data, error } = await supabase.from(currentConfig.tableName).select('*');
    if (!error && data) {
      if (currentMode === 'articles') {
        setArticles(data);
      } else {
        setBooks(data);
      }
    }
  }, [currentConfig.tableName, currentMode]);

  const fetchBorrows = useCallback(async () => {
    const itemTable = currentMode === 'articles' ? 'equipment' : 'books';
    const { data, error } = await supabase.from(currentConfig.borrowTableName).select(`
        *,
        ${currentMode === 'articles' ? 'equipment' : 'book'}:${itemTable}(*)
      `);
    if (!error && data) setBorrows(data);
  }, [currentConfig.borrowTableName, currentMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    fetchArticles();
    fetchBorrows();
  }, [currentMode, fetchArticles, fetchBorrows]); //recharge les données quand on change de mode

  const addToCartHandler = (item: Article | Book) => {
    setCart(addToCart(cart, item));
  };

  const clearCartHandler = () => {
    setCart(clearCart());
    setShowModeLockedToast(false);
  };

  const removeFromCartHandler = (itemId: number) => {
    setCart(removeFromCart(cart, itemId));
  };

  const confirmBorrowHandler = async () => {
    await confirmBorrow(cart, borrower, currentMode, fetchArticles, fetchBorrows);
    setCart([]);
    setShowModeLockedToast(false);
    setStep('catalogue');
  };

  const returnItemHandler = async (borrowId: number) => {
    await returnItem(borrowId, currentMode, fetchArticles, fetchBorrows);
  };

  const handleLoginHandler = async () => {
    await handleLogin(adminEmail, adminPassword, setSession, setStep);
  };

  const addItemHandler = async (itemData: Partial<Article | Book>) => {
    await addItem(itemData, currentMode, fetchArticles);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl pb-12">
        {/* Header */}
        <div className="app-header text-center">
          <h1 className="text-4xl font-bold mb-2">
            <i className={`${currentConfig.icon} mr-3`}></i>
            CAF Avignon - {currentConfig.name}
          </h1>
          <p className="lead text-lg text-gray-600">
            Consultez et empruntez{' '}
            {currentMode === 'articles' ? 'le matériel de montagne' : 'les livres'} du club
          </p>
        </div>

        {/* Mode Selector */}
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
                disabled={isModeLockedByCart && mode !== currentMode}
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
                  Impossible de changer de mode : videz d'abord votre panier pour éviter de mélanger
                  les emprunts
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <NavTabs
          tabs={[
            {
              id: 'catalogue',
              label: 'Catalogue',
              icon: 'fas fa-list',
              isActive: step === 'catalogue',
              onClick: () => setStep('catalogue'),
            },
            {
              id: 'cart',
              label: 'Panier',
              icon: 'fas fa-shopping-cart',
              isActive: step === 'cart',
              onClick: () => setStep('cart'),
              badge: cart.length.toString(),
            },
            {
              id: 'borrows',
              label: 'Emprunts',
              icon: 'fas fa-hand-holding',
              isActive: step === 'borrows',
              onClick: () => setStep('borrows'),
            },
            {
              id: 'login',
              label: 'Admin',
              icon: 'fas fa-lock',
              isActive: step === 'login',
              onClick: () => setStep('login'),
            },
          ]}
          //currentStep={step}
        />

        {/* Catalogue Tab */}
        {step === 'catalogue' && (
          <Catalog
            items={currentItems}
            search={search}
            onSearchChange={setSearch}
            cart={cart}
            onAddToCart={addToCartHandler}
            currentMode={currentMode}
          />
        )}

        {/* Cart Tab */}
        {step === 'cart' && (
          <CartTab
            cart={cart}
            onRemoveFromCart={removeFromCartHandler}
            onClearCart={clearCartHandler}
            onProceedToBorrow={() => setStep('borrow')}
            onGoToCatalogue={() => setStep('catalogue')}
            currentMode={currentMode}
          />
        )}

        {/* Borrow Form Tab */}
        {step === 'borrow' && (
          <BorrowFormTab
            cart={cart}
            borrower={borrower}
            onBorrowerChange={(field, value) => setBorrower({ ...borrower, [field]: value })}
            onConfirmBorrow={confirmBorrowHandler}
            onBackToCart={() => setStep('cart')}
            currentMode={currentMode}
          />
        )}

        {/* Login Tab */}
        {step === 'login' && (
          <LoginTab
            email={adminEmail}
            password={adminPassword}
            onEmailChange={setAdminEmail}
            onPasswordChange={setAdminPassword}
            onLogin={handleLoginHandler}
          />
        )}

        {/* Admin Tab */}
        {step === 'admin' && session && (
          <AdminTab
            items={currentItems}
            onAddItem={addItemHandler}
            currentMode={currentMode}
            currentConfigName={currentConfig.name}
          />
        )}

        {/* Borrows Tab */}
        {step === 'borrows' && (
          <BorrowsTab
            borrows={borrows}
            onReturnItem={returnItemHandler}
            currentMode={currentMode}
          />
        )}

        {/* Footer */}
      </div>
      <footer className="py-6 bg-gray-800 text-white text-center w-full">
        <p>
          <i className="fas fa-mountain mr-2"></i>
          Club Alpin Français - Section d'Avignon et Vaucluse
        </p>
      </footer>
    </div>
  );
}

/* function AddItemForm({
  onAdd,
  currentMode,
}: {
  onAdd: (itemData: Partial<Article | Book>) => void;
  currentMode: AppMode;
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    if (currentMode === 'articles') {
      if (formData.designation) {
        onAdd(formData);
        setFormData({});
      }
    } else {
      if (formData.title) {
        onAdd(formData);
        setFormData({});
      }
    }
  };

  const isValid = currentMode === 'articles' ? !!formData.designation : !!formData.title;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">
          <i className="fas fa-plus-circle mr-2"></i>
          Ajouter un nouveau {currentMode === 'articles' ? 'matériel' : 'livre'}
        </h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentMode === 'articles' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Désignation *
                </label>
                <Input
                  placeholder="Ex: Casque Petzl Boreo"
                  value={formData.designation || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Input
                  placeholder="Ex: casque, corde, baudrier..."
                  value={formData.type || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="form-control"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <Input
                  placeholder="Titre du livre"
                  value={formData.title || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auteur</label>
                <Input
                  placeholder="Nom de l'auteur"
                  value={formData.author || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="form-control"
                />
              </div>
            </>
          )}
        </div>
        <Button onClick={handleSubmit} disabled={!isValid} className="mt-4 btn-primary">
          <i className="fas fa-plus-circle mr-2"></i>
          Ajouter {currentMode === 'articles' ? 'le matériel' : 'le livre'}
        </Button>
      </div>
    </div>
  );
} */
