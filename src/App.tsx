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
import Header from './components/ui/Header';
import Footer from './components/ui/Footer';
import ModeSelector from './components/ui/ModeSelector';

import { Toaster } from 'react-hot-toast';

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
        <Header currentMode={currentMode} />

        {/* Mode Selector */}
        <ModeSelector
          currentMode={currentMode}
          cart={cart}
          setCurrentMode={setCurrentMode}
          showModeLockedToast={showModeLockedToast}
          setShowModeLockedToast={setShowModeLockedToast}
        />

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

        {/* Borrows Tab */}
        {step === 'borrows' && (
          <BorrowsTab
            borrows={borrows}
            onReturnItem={returnItemHandler}
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
      </div>

      {/* Footer */}
      <Footer />

      {/* Ne pas supprimer */}
      <Toaster />
    </div>
  );
}
