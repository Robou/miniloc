// Utilitaires de protection contre les attaques par force brute

const RATE_LIMIT_KEY = 'auth_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes en millisecondes

interface RateLimitData {
  attempts: number;
  lastAttempt: number;
  lockoutUntil?: number;
}

/**
 * Vérifie si l'utilisateur est en période de lockout
 */
export const isRateLimited = (identifier: string = 'default'): boolean => {
  const key = `${RATE_LIMIT_KEY}_${identifier}`;
  const stored = localStorage.getItem(key);

  if (!stored) {
    return false;
  }

  try {
    const data: RateLimitData = JSON.parse(stored);

    // Vérifier si le lockout est toujours actif
    if (data.lockoutUntil && Date.now() < data.lockoutUntil) {
      return true;
    }

    // Nettoyer les données expirées
    if (Date.now() - data.lastAttempt > 24 * 60 * 60 * 1000) {
      // 24h
      localStorage.removeItem(key);
      return false;
    }

    return false;
  } catch {
    localStorage.removeItem(key);
    return false;
  }
};

/**
 * Enregistre une tentative de connexion échouée
 */
export const recordFailedAttempt = (identifier: string = 'default'): void => {
  const key = `${RATE_LIMIT_KEY}_${identifier}`;
  const stored = localStorage.getItem(key);
  let data: RateLimitData = stored ? JSON.parse(stored) : { attempts: 0, lastAttempt: 0 };

  data.attempts += 1;
  data.lastAttempt = Date.now();

  // Activer le lockout après MAX_ATTEMPTS tentatives
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockoutUntil = Date.now() + LOCKOUT_TIME;
  }

  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Réinitialise le compteur après une connexion réussie
 */
export const resetRateLimit = (identifier: string = 'default'): void => {
  const key = `${RATE_LIMIT_KEY}_${identifier}`;
  localStorage.removeItem(key);
};

/**
 * Récupère les informations de rate limiting
 */
export const getRateLimitInfo = (identifier: string = 'default') => {
  const key = `${RATE_LIMIT_KEY}_${identifier}`;
  const stored = localStorage.getItem(key);

  if (!stored) {
    return {
      attempts: 0,
      remainingAttempts: MAX_ATTEMPTS,
      isLocked: false,
      lockoutTimeRemaining: 0,
    };
  }

  try {
    const data: RateLimitData = JSON.parse(stored);
    const isLocked = data.lockoutUntil ? Date.now() < data.lockoutUntil : false;
    const remainingAttempts = Math.max(0, MAX_ATTEMPTS - data.attempts);
    const lockoutTimeRemaining = data.lockoutUntil
      ? Math.max(0, data.lockoutUntil - Date.now())
      : 0;

    return {
      attempts: data.attempts,
      remainingAttempts,
      isLocked,
      lockoutTimeRemaining,
    };
  } catch {
    return {
      attempts: 0,
      remainingAttempts: MAX_ATTEMPTS,
      isLocked: false,
      lockoutTimeRemaining: 0,
    };
  }
};

/**
 * Formate le temps de lockout restant en minutes/secondes
 */
export const formatLockoutTime = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / (60 * 1000));
  const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);

  if (minutes > 0) {
    return `${minutes}min ${seconds}s`;
  }
  return `${seconds}s`;
};
