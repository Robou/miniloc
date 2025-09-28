import supabase from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { validateCSRFToken } from './csrfUtils';
import {
  isRateLimited,
  recordFailedAttempt,
  resetRateLimit,
  getRateLimitInfo,
} from './rateLimitUtils';
import { logSecurityEvent } from './securityLoggerUtils';

type AppStep = 'catalogue' | 'cart' | 'borrow' | 'login' | 'admin' | 'borrows';

export const handleLogin = async (
  email: string,
  password: string,
  csrfToken: string,
  setSession: (session: Session | null) => void,
  setStep: (step: AppStep) => void
): Promise<void> => {
  // Validation CSRF
  if (!validateCSRFToken(csrfToken)) {
    logSecurityEvent.csrfViolation({ email, reason: 'invalid_token' });
    alert('Erreur de sécurité : token CSRF invalide');
    return;
  }

  // Vérification du rate limiting
  if (isRateLimited(email)) {
    const rateLimitInfo = getRateLimitInfo(email);
    const timeRemaining = Math.ceil(rateLimitInfo.lockoutTimeRemaining! / (60 * 1000));
    logSecurityEvent.rateLimitExceeded(email, rateLimitInfo.attempts);
    alert(`Trop de tentatives. Réessayez dans ${timeRemaining} minutes.`);
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Enregistrer la tentative échouée pour le rate limiting
    recordFailedAttempt(email);

    // Logger l'échec de connexion
    logSecurityEvent.failedLogin(email, error.message);

    // Sécurisation : message d'erreur générique pour éviter l'énumération d'utilisateurs
    alert('Identifiants incorrects');
    return;
  }

  if (data.session) {
    // Réinitialiser le rate limiting après connexion réussie
    resetRateLimit(email);
    setSession(data.session);
    setStep('admin');
  } else {
    alert('Échec de connexion administrateur');
  }
};
