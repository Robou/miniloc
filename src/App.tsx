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
          element.classList.add('animate-bounce');
          setTimeout(() => {
            element.classList.remove('animate-bounce');
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
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">CAF Avignon - Prêt de Matériel</h1>

      <div className="mb-4 space-x-2">
        <Button onClick={() => setStep('catalogue')}>Catalogue</Button>
        <Button onClick={() => setStep('cart')}>Panier ({cart.length})</Button>
        <Button onClick={() => setStep('borrows')}>Emprunts</Button>
        <Button onClick={() => setStep('login')}>Admin</Button>
      </div>

      {step === 'catalogue' && (
        <div>
          <Input
            placeholder="Rechercher un article"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="mb-4"
          />
          <div className="grid grid-cols-2 gap-4">
            {articles
              .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
              .map((article) => {
                const isInCart = !!cart.find((a) => a.id === article.id);
                return (
                  <div
                    key={article.id}
                    id={`article-${article.id}`}
                    className="border p-2 rounded shadow transition-transform duration-200"
                    style={{
                      animationDuration: '0.3s',
                      animationIterationCount: '1',
                    }}
                  >
                    <h2 className="font-semibold">{article.name}</h2>
                    <p className="text-sm text-gray-600">Type: {article.type}</p>
                    <Button
                      onClick={() => addToCart(article)}
                      disabled={!article.available || isInCart}
                      className={`mt-2 ${isInCart ? 'bg-gray-400 text-gray-600' : ''}`}
                    >
                      {!article.available
                        ? 'Indisponible'
                        : isInCart
                          ? 'Ajouté au panier'
                          : 'Ajouter au panier'}
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {step === 'cart' && (
        <div>
          {cart.length === 0 ? (
            <p className="text-gray-500">Votre panier est vide.</p>
          ) : (
            <>
              {cart.map((a) => (
                <div key={a.id} className="mb-2 flex justify-between items-center border-b pb-2">
                  <span>
                    {a.name} ({a.type})
                  </span>
                  <Button variant="outline" size="sm" onClick={() => removeFromCart(a.id)}>
                    Retirer
                  </Button>
                </div>
              ))}
              <div className="mt-4 space-x-2">
                <Button onClick={() => setStep('borrow')}>Emprunter</Button>
                <Button variant="outline" onClick={clearCart}>
                  Vider panier
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 'borrow' && (
        <div className="space-y-2">
          <Input
            placeholder="Votre nom"
            value={borrower.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBorrower({ ...borrower, name: e.target.value })
            }
          />
          <Input
            placeholder="Votre email (facultatif)"
            value={borrower.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBorrower({ ...borrower, email: e.target.value })
            }
          />
          <Button onClick={confirmBorrow}>Valider l'emprunt</Button>
        </div>
      )}

      {step === 'login' && (
        <div className="space-y-2">
          <Input
            placeholder="Email admin"
            value={adminEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Mot de passe"
            value={adminPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminPassword(e.target.value)}
          />
          <Button onClick={handleLogin}>Connexion</Button>
        </div>
      )}

      {step === 'admin' && session && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Espace Administrateur</h2>
          <AddArticleForm onAdd={addArticle} />
          <div>
            <h3 className="font-medium">Articles existants</h3>
            {articles.map((a) => (
              <div key={a.id}>
                {a.name} - {a.type} - {a.available ? '✔️' : '❌'}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'borrows' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Emprunts en cours</h2>
          {borrows.length === 0 ? (
            <p>Aucun emprunt en cours.</p>
          ) : (
            <div className="grid gap-4">
              {borrows.map((borrow) => (
                <div key={borrow.id} className="border p-3 rounded shadow">
                  <div className="font-medium">
                    {borrow.article && borrow.article.name
                      ? `${borrow.article.name} (${borrow.article.type || 'Type inconnu'})`
                      : `Article ID: ${borrow.article_id}`}
                  </div>
                  <div className="text-sm">Emprunté par: {borrow.name}</div>
                  <div className="text-sm">Contact: {borrow.email}</div>
                  <div className="text-sm text-gray-500">
                    Date: {new Date(borrow.borrowed_at).toLocaleDateString()}
                  </div>
                  <Button
                    onClick={() => returnArticle(borrow.id)}
                    className="mt-2"
                    variant="outline"
                  >
                    Retourner
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddArticleForm({ onAdd }: { onAdd: (name: string, type: string) => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Nom de l'article"
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
      />
      <Input
        placeholder="Type (ex: livre, casque...)"
        value={type}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setType(e.target.value)}
      />
      <Button
        onClick={() => {
          onAdd(name, type);
          setName('');
          setType('');
        }}
      >
        Ajouter l'article
      </Button>
    </div>
  );
}
