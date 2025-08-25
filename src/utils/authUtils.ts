import supabase from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

type AppStep = 'catalogue' | 'cart' | 'borrow' | 'login' | 'admin' | 'borrows';

export const handleLogin = async (
  email: string,
  password: string,
  setSession: (session: Session | null) => void,
  setStep: (step: AppStep) => void
): Promise<void> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
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
};
