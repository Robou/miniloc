import { Session } from '@supabase/supabase-js';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import supabase from './lib/supabase';

import { AppMode, Article, Book, BookBorrow, Borrow, MODE_CONFIGS } from './types/AppMode';
//import ItemCard from './components/ui/ItemCard';
import NavTabs from './components/ui/NavTabs';
import Catalog from './components/CatalogTab';
//import SearchBar from './components/ui/SearchBar';
import CartTab from './components/CartTab';
import BorrowFormTab from './components/BorrowFormTab';
import BorrowsTab from './components/BorrowsTab';

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
  const [borrows, setBorrows] = useState<Borrow[] | BookBorrow[]>([]);
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

  function addToCart(item: Article | Book) {
    if (!cart.find((a) => a.id === item.id)) {
      setCart([...cart, item]);

      // Déclencher l'animation directement sur l'élément
      setTimeout(() => {
        const element = document.getElementById(`item-${item.id}`);
        if (element) {
          element.classList.add('bounce-in');
          setTimeout(() => {
            element.classList.remove('bounce-in');
          }, 300);
        }
      }, 10);
    }
  }

  function clearCart() {
    setCart([]);
    // Masquer le toast si affiché
    setShowModeLockedToast(false);
  }

  function removeFromCart(itemId: number) {
    setCart(cart.filter((a) => a.id !== itemId));
  }

  async function confirmBorrow() {
    const errors: string[] = [];

    for (const item of cart) {
      const params: Record<string, string | number | null> = {
        [`p_${currentConfig.itemIdField.replace('_id', '')}_id`]: item.id,
        p_name: borrower.name,
        p_email: borrower.email || null,
      };

      // Ajouter les champs spécifiques au matériel de montagne
      if (currentMode === 'articles') {
        if (borrower.rental_price) {
          params.p_rental_price = parseFloat(borrower.rental_price);
        }
        if (borrower.supervisor_name) {
          params.p_supervisor_name = borrower.supervisor_name;
        }
      }

      const { data, error } = await supabase.rpc(currentConfig.createFunction, params);

      const itemName =
        currentMode === 'articles'
          ? (item as Article).designation || (item as Article).name || 'Article'
          : (item as Book).title;

      if (error) {
        errors.push(`Erreur technique pour ${itemName}: ${error.message}`);
        continue;
      }

      if (!data.success) {
        errors.push(`${itemName}: ${data.error}`);
        continue;
      }
    }

    if (errors.length > 0) {
      alert(
        `Erreurs lors de l'emprunt:\n${errors.join('\n')}\n\nVeuillez corriger les informations et réessayer.`
      );
      return;
    }

    alert('Emprunt réalisé avec succès !');
    setCart([]);
    setShowModeLockedToast(false);
    setStep('catalogue');
    fetchArticles();
    fetchBorrows();
  }

  async function returnItem(borrowId: number) {
    const itemType = currentMode === 'articles' ? 'article' : 'livre';
    if (!confirm(`Êtes-vous sûr de vouloir retourner cet ${itemType} ?`)) {
      return;
    }

    const { data, error } = await supabase.rpc(currentConfig.returnFunction, {
      p_borrow_id: borrowId,
    });

    if (error) {
      alert(`Erreur technique lors du retour: ${error.message}`);
      return;
    }

    if (!data.success) {
      alert(`Erreur lors du retour: ${data.error}`);
      return;
    }

    alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} retourné avec succès !`);
    fetchArticles();
    fetchBorrows();
  }

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      alert(`Erreur de connexion : ${error.message}`);
      return;
    }

    if (data.session) {
      setSession(data.session);
      setStep('admin');
    } else {
      alert('Échec de connexion administrateur');
    }
  }

  async function addItem(itemData: Partial<Article | Book>) {
    const { error } = await supabase.from(currentConfig.tableName).insert(itemData);
    if (!error) fetchArticles();
  }

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
            onAddToCart={addToCart}
            currentMode={currentMode}
          />
        )}

        {/* Cart Tab */}
        {step === 'cart' && (
          <CartTab
            cart={cart}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
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
            onConfirmBorrow={confirmBorrow}
            onBackToCart={() => setStep('cart')}
            currentMode={currentMode}
          />
        )}

        {/* Login Tab */}
        {step === 'login' && (
          <div className="fade-in">
            <div className="card max-w-md mx-auto">
              <div className="card-header">
                <h2 className="text-xl font-bold">
                  <i className="fas fa-lock mr-2"></i>
                  Connexion Administrateur
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email administrateur
                    </label>
                    <Input
                      placeholder="admin@exemple.com"
                      value={adminEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAdminEmail(e.target.value)
                      }
                      className="form-control"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAdminPassword(e.target.value)
                      }
                      className="form-control"
                    />
                  </div>
                  <Button onClick={handleLogin} className="w-full btn-primary">
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Se connecter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tab */}
        {step === 'admin' && session && (
          <div className="fade-in">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-bold">
                  <i className="fas fa-cogs mr-2"></i>
                  Espace Administrateur
                </h2>
              </div>
              <div className="card-body">
                <AddItemForm onAdd={addItem} currentMode={currentMode} />

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">{currentConfig.name} existants</h3>
                  <div className="grid gap-4">
                    {currentItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {currentMode === 'articles'
                              ? (item as Article).designation || (item as Article).name || 'Article'
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
        )}

        {/* Borrows Tab */}
        {step === 'borrows' && (
          <BorrowsTab borrows={borrows} onReturnItem={returnItem} currentMode={currentMode} />
        )}

        {/* Footer */}
        {/* <div className="footer mt-12">
          <p>
            <i className="fas fa-mountain mr-2"></i>
            Club Alpin Français - Section d'Avignon et Vaucluse
          </p>
        </div> */}
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

function AddItemForm({
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
}
