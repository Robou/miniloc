import React, { useState, useEffect } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Type pour les livres
type Book = {
  id: number;
  title: string;
  author?: string;
  category?: string;
  publisher?: string;
  publication_year?: number;
  description?: string;
  keywords?: string;
  isbn?: string;
  type?: string;
  storage_location?: string;
  available: boolean;
  created_at: string;
};

// Type pour les articles (matériel de montagne)
type Article = {
  id: number;
  // Champs existants
  name?: string; // Garde pour compatibilité, mais sera remplacé par designation
  type?: string;
  available: boolean;
  created_at?: string;
  // Nouveaux champs pour le matériel de montagne
  designation?: string;
  is_epi?: boolean;
  color?: string;
  manufacturer?: string;
  model?: string;
  size?: string;
  manufacturer_id?: string;
  club_id?: string;
  manufacturing_date?: string;
  operational_status?: string;
  usage_notes?: string;
};

type BookBorrow = {
  id: number;
  book_id: number;
  name: string;
  email?: string;
  borrowed_at: string;
  book: Book;
};

type Borrow = {
  id: number;
  article_id: number;
  name: string;
  email?: string;
  borrowed_at: string;
  // Nouveaux champs pour les emprunts de matériel
  rental_price?: number;
  supervisor_name?: string;
  article: Article;
};

// Configuration des modes
type AppMode = 'articles' | 'books';

type ModeConfig = {
  name: string;
  icon: string;
  tableName: string;
  borrowTableName: string;
  itemIdField: string;
  displayField: string;
  createFunction: string;
  returnFunction: string;
};

const MODE_CONFIGS: Record<AppMode, ModeConfig> = {
  articles: {
    name: 'Matériel de montagne',
    icon: 'fas fa-mountain',
    tableName: 'equipment', // Utilise la nouvelle table equipment
    borrowTableName: 'equipment_borrows',
    itemIdField: 'equipment_id',
    displayField: 'designation',
    createFunction: 'create_equipment_borrow',
    returnFunction: 'return_equipment',
  },
  books: {
    name: 'Bibliothèque',
    icon: 'fas fa-book',
    tableName: 'books',
    borrowTableName: 'book_borrows',
    itemIdField: 'book_id',
    displayField: 'title',
    createFunction: 'create_book_borrow',
    returnFunction: 'return_book',
  },
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('articles');
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

  const currentConfig = MODE_CONFIGS[currentMode];
  const currentItems = currentMode === 'articles' ? articles : books;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    fetchArticles();
    fetchBorrows();
  });

  async function fetchArticles() {
    const { data, error } = await supabase.from(currentConfig.tableName).select('*');
    if (!error && data) {
      if (currentMode === 'articles') {
        setArticles(data);
      } else {
        setBooks(data);
      }
    }
  }

  async function fetchBorrows() {
    const itemTable = currentMode === 'articles' ? 'equipment' : 'books';
    const { data, error } = await supabase.from(currentConfig.borrowTableName).select(`
        *,
        ${currentMode === 'articles' ? 'equipment' : 'book'}:${itemTable}(*)
      `);
    if (!error && data) setBorrows(data);
  }

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
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-1 flex">
            {Object.entries(MODE_CONFIGS).map(([mode, config]) => (
              <button
                key={mode}
                onClick={() => setCurrentMode(mode as AppMode)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentMode === mode
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i className={`${config.icon} mr-2`}></i>
                {config.name}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs flex flex-wrap mb-6">
          <button
            className={`nav-tab ${step === 'catalogue' ? 'active' : ''}`}
            onClick={() => setStep('catalogue')}
          >
            <i className="fas fa-list mr-2"></i>
            Catalogue
          </button>
          <button
            className={`nav-tab ${step === 'cart' ? 'active' : ''}`}
            onClick={() => setStep('cart')}
          >
            <i className="fas fa-shopping-cart mr-2"></i>
            Panier ({cart.length})
          </button>
          <button
            className={`nav-tab ${step === 'borrows' ? 'active' : ''}`}
            onClick={() => setStep('borrows')}
          >
            <i className="fas fa-hand-holding mr-2"></i>
            Emprunts
          </button>
          <button
            className={`nav-tab admin-tab ${step === 'login' ? 'active' : ''}`}
            onClick={() => setStep('login')}
          >
            <i className="fas fa-lock mr-2"></i>
            Admin
          </button>
        </div>

        {/* Catalogue Tab */}
        {step === 'catalogue' && (
          <div className="fade-in">
            {/* Search Bar */}
            <div className="search-container">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      placeholder="Rechercher un article..."
                      value={search}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearch(e.target.value)
                      }
                      className="form-control pl-10"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                <Button className="btn-primary">
                  <i className="fas fa-search mr-2"></i>
                  Rechercher
                </Button>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems
                .filter((item) => {
                  const searchField =
                    currentMode === 'articles'
                      ? (item as Article).designation || (item as Article).name || ''
                      : (item as Book).title || '';
                  return searchField.toLowerCase().includes(search.toLowerCase());
                })
                .map((item) => {
                  const isInCart = !!cart.find((a) => a.id === item.id);
                  const itemType =
                    currentMode === 'articles' ? (item as Article).type : (item as Book).category;
                  const typeClass = `type-${itemType?.toLowerCase().replace(/\s+/g, '-') || 'default'}`;

                  const displayName =
                    currentMode === 'articles'
                      ? (item as Article).designation || (item as Article).name || 'Article'
                      : (item as Book).title;

                  return (
                    <div
                      key={item.id}
                      id={`item-${item.id}`}
                      className={`card article-card ${typeClass} fade-in`}
                    >
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
                          onClick={() => addToCart(item)}
                          disabled={!item.available || isInCart}
                          className={`w-full ${
                            !item.available
                              ? 'btn-unavailable'
                              : isInCart
                                ? 'btn-added'
                                : 'btn-primary'
                          }`}
                        >
                          <i
                            className={`fas ${
                              !item.available ? 'fa-ban' : isInCart ? 'fa-check' : 'fa-plus'
                            } mr-2`}
                          ></i>
                          {!item.available
                            ? 'Indisponible'
                            : isInCart
                              ? 'Ajouté au panier'
                              : 'Ajouter au panier'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {currentItems.filter((item) => {
              const searchField =
                currentMode === 'articles'
                  ? (item as Article).designation || (item as Article).name || ''
                  : (item as Book).title || '';
              return searchField.toLowerCase().includes(search.toLowerCase());
            }).length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">
                  Aucun {currentMode === 'articles' ? 'article' : 'livre'} trouvé
                </p>
              </div>
            )}
          </div>
        )}

        {/* Cart Tab */}
        {step === 'cart' && (
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
                    <Button onClick={() => setStep('catalogue')} className="mt-4 btn-primary">
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
                                ? (item as Article).designation ||
                                  (item as Article).name ||
                                  'Article'
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
                            onClick={() => removeFromCart(item.id)}
                            className="btn-outline"
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Retirer
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => setStep('borrow')} className="btn-primary flex-1">
                        <i className="fas fa-check-circle mr-2"></i>
                        Procéder à l'emprunt
                      </Button>
                      <Button variant="outline" onClick={clearCart} className="btn-outline">
                        <i className="fas fa-trash mr-2"></i>
                        Vider le panier
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Borrow Form Tab */}
        {step === 'borrow' && (
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
                  <h3 className="font-semibold mb-3">Articles à emprunter :</h3>
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <i className="fas fa-check-circle text-blue-500 mr-3"></i>
                        <span className="font-medium">
                          {currentMode === 'articles'
                            ? (item as Article).designation || (item as Article).name || 'Article'
                            : (item as Book).title}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          (
                          {currentMode === 'articles'
                            ? (item as Article).type
                            : (item as Book).category}
                          )
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-user mr-1"></i>
                      Votre nom *
                    </label>
                    <Input
                      placeholder="Entrez votre nom complet"
                      value={borrower.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setBorrower({ ...borrower, name: e.target.value })
                      }
                      className="form-control"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-envelope mr-1"></i>
                      Votre email (facultatif)
                    </label>
                    <Input
                      placeholder="votre.email@exemple.com"
                      value={borrower.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setBorrower({ ...borrower, email: e.target.value })
                      }
                      className="form-control"
                      type="email"
                    />
                  </div>

                  {/* Champs spécifiques au matériel de montagne */}
                  {currentMode === 'articles' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-euro-sign mr-1"></i>
                          Prix d'emprunt (facultatif)
                        </label>
                        <Input
                          placeholder="0.00"
                          value={borrower.rental_price}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setBorrower({ ...borrower, rental_price: e.target.value })
                          }
                          className="form-control"
                          type="number"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-user-tie mr-1"></i>
                          Nom de l'encadrant (facultatif)
                        </label>
                        <Input
                          placeholder="Nom de l'encadrant pour la sortie"
                          value={borrower.supervisor_name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setBorrower({ ...borrower, supervisor_name: e.target.value })
                          }
                          className="form-control"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={confirmBorrow}
                      className="btn-primary flex-1"
                      disabled={!borrower.name}
                    >
                      <i className="fas fa-check-circle mr-2"></i>
                      Confirmer l'emprunt
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setStep('cart')}
                      className="btn-outline"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Retour au panier
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                                  ? (borrow as Borrow).article?.designation ||
                                    (borrow as Borrow).article?.name ||
                                    `Article ID: ${(borrow as Borrow).article_id}`
                                  : (borrow as BookBorrow).book?.title ||
                                    `Livre ID: ${(borrow as BookBorrow).book_id}`}
                              </h4>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600">
                                  <i className="fas fa-tag mr-2"></i>
                                  Type:{' '}
                                  {currentMode === 'articles'
                                    ? (borrow as Borrow).article?.type || 'Type inconnu'
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
                            <Button onClick={() => returnItem(borrow.id)} className="btn-success">
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
