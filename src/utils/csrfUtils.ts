// Utilitaires de protection CSRF (Cross-Site Request Forgery)

const CSRF_TOKEN_KEY = 'csrf_token';
const TOKEN_EXPIRY_KEY = 'csrf_token_expiry';
const TOKEN_LIFETIME = 60 * 60 * 1000; // 1 heure en millisecondes

/**
 * Génère un token CSRF sécurisé
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Stocke un token CSRF en sessionStorage avec expiration
 */
export const storeCSRFToken = (token: string): void => {
  const expiry = Date.now() + TOKEN_LIFETIME;
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
};

/**
 * Récupère le token CSRF actuel
 */
export const getCSRFToken = (): string | null => {
  const token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiry) {
    return null;
  }

  // Vérifier si le token n'a pas expiré
  if (Date.now() > parseInt(expiry)) {
    clearCSRFToken();
    return null;
  }

  return token;
};

/**
 * Supprime le token CSRF
 */
export const clearCSRFToken = (): void => {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Initialise ou récupère un token CSRF valide
 */
export const getOrCreateCSRFToken = (): string => {
  let token = getCSRFToken();

  if (!token) {
    token = generateCSRFToken();
    storeCSRFToken(token);
  }

  return token;
};

/**
 * Valide un token CSRF reçu
 */
export const validateCSRFToken = (receivedToken: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken === receivedToken;
};
