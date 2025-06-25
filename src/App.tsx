import React, { useState, useEffect } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

type Article = {
  id: number;
  name: string;
  type: string;
  available: boolean;
};

type Borrow = {
  id: number;
  article_id: number;
  name: string;
  email: string;
  borrowed_at: string;
  article: Article;
};

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Article[]>([]);
  const [step, setStep] = useState<'catalogue' | 'cart' | 'borrow' | 'login' | 'admin' | 'borrows'>(
    'catalogue'
  );
  const [borrower, setBorrower] = useState({ name: '', email: '' });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [borrows, setBorrows] = useState<Borrow[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    fetchArticles();
    fetchBorrows();
  }, []);

  async function fetchArticles() {
    const { data, error } = await supabase.from('articles').select('*');
    if (!error && data) setArticles(data);
  }

  async function fetchBorrows() {
    const { data, error } = await supabase.from('borrows').select(`
        *,
        article:articles(*)
      `);
    if (!error && data) setBorrows(data);
  }

  function addToCart(article: Article) {
    if (!cart.find((a) => a.id === article.id)) {
      setCart([...cart, article]);

      // Déclencher l'animation directement sur l'élément
      setTimeout(() => {
        const element = document.getElementById(`article-${article.id}`);
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

  function removeFromCart(articleId: number) {
    setCart(cart.filter((a) => a.id !== articleId));
  }

  async function confirmBorrow() {
    const errors: string[] = [];

    for (const article of cart) {
      const { data, error } = await supabase.rpc('create_borrow', {
        p_article_id: article.id,
        p_name: borrower.name,
        p_email: borrower.email || null, // Email facultatif
      });

      if (error) {
        errors.push(`Erreur technique pour ${article.name}: ${error.message}`);
        continue;
      }

      if (!data.success) {
        errors.push(`${article.name}: ${data.error}`);
        continue;
      }
    }

    if (errors.length > 0) {
      alert(
        `Erreurs lors de l'emprunt:\n${errors.join('\n')}\n\nVeuillez corriger les informations et réessayer.`
      );
      // Rester sur l'écran de saisie pour permettre de corriger
      return;
    }

    // Tout s'est bien passé
    alert('Emprunt réalisé avec succès !');
    setCart([]);
    setStep('catalogue');
    fetchArticles();
    fetchBorrows();
  }

  async function returnArticle(borrowId: number) {
    if (!confirm('Êtes-vous sûr de vouloir retourner cet article ?')) {
      return;
    }

    const { data, error } = await supabase.rpc('return_article', {
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

    alert('Article retourné avec succès !');
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

  async function addArticle(name: string, type: string) {
    const { error } = await supabase.from('articles').insert({ name, type });
    if (!error) fetchArticles();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl pb-12">
        {/* Header */}
        <div className="app-header text-center">
          <h1 className="text-4xl font-bold mb-2">
            <i className="fas fa-mountain mr-3"></i>
            CAF Avignon - Prêt de Matériel
          </h1>
          <p className="lead text-lg text-gray-600">
            Consultez et empruntez le matériel de montagne du club
          </p>
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

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles
                .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
                .map((article) => {
                  const isInCart = !!cart.find((a) => a.id === article.id);
                  const typeClass = `type-${article.type?.toLowerCase().replace(/\s+/g, '-') || 'default'}`;

                  return (
                    <div
                      key={article.id}
                      id={`article-${article.id}`}
                      className={`card article-card ${typeClass} fade-in`}
                    >
                      <div className="card-body">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-lg text-gray-800 flex-1">{article.name}</h3>
                          <div className="ml-2">
                            {article.available ? (
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
                            {article.type || 'Non spécifié'}
                          </span>
                        </div>

                        <Button
                          onClick={() => addToCart(article)}
                          disabled={!article.available || isInCart}
                          className={`w-full ${
                            !article.available
                              ? 'btn-unavailable'
                              : isInCart
                                ? 'btn-added'
                                : 'btn-primary'
                          }`}
                        >
                          <i
                            className={`fas ${
                              !article.available ? 'fa-ban' : isInCart ? 'fa-check' : 'fa-plus'
                            } mr-2`}
                          ></i>
                          {!article.available
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

            {articles.filter((a) => a.name.toLowerCase().includes(search.toLowerCase())).length ===
              0 && (
              <div className="text-center py-12">
                <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">Aucun article trouvé</p>
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
                      {cart.map((article) => (
                        <div
                          key={article.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{article.name}</h4>
                            <p className="text-sm text-gray-600">
                              <i className="fas fa-tag mr-1"></i>
                              {article.type}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(article.id)}
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
                    {cart.map((article) => (
                      <div key={article.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <i className="fas fa-check-circle text-blue-500 mr-3"></i>
                        <span className="font-medium">{article.name}</span>
                        <span className="ml-2 text-sm text-gray-600">({article.type})</span>
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
                <AddArticleForm onAdd={addArticle} />

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Articles existants</h3>
                  <div className="grid gap-4">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{article.name}</h4>
                          <p className="text-sm text-gray-600">{article.type}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {article.available ? (
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
                                {borrow.article && borrow.article.name
                                  ? `${borrow.article.name}`
                                  : `Article ID: ${borrow.article_id}`}
                              </h4>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600">
                                  <i className="fas fa-tag mr-2"></i>
                                  Type: {borrow.article?.type || 'Type inconnu'}
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
                            <Button
                              onClick={() => returnArticle(borrow.id)}
                              className="btn-success"
                            >
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

function AddArticleForm({ onAdd }: { onAdd: (name: string, type: string) => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">
          <i className="fas fa-plus-circle mr-2"></i>
          Ajouter un nouvel article
        </h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'article</label>
            <Input
              placeholder="Ex: Casque Petzl Boreo"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className="form-control"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <Input
              placeholder="Ex: casque, corde, baudrier..."
              value={type}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setType(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            if (name && type) {
              onAdd(name, type);
              setName('');
              setType('');
            }
          }}
          disabled={!name || !type}
          className="mt-4 btn-primary"
        >
          <i className="fas fa-plus-circle mr-2"></i>
          Ajouter l'article
        </Button>
      </div>
    </div>
  );
}
