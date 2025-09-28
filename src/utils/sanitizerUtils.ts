// Utilitaires d'échappement et de sanitisation pour protection XSS

/**
 * Échappe les caractères HTML spéciaux
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Nettoie le texte pour affichage sécurisé
 */
export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    .replace(/[<>]/g, '') // Supprime les chevrons
    .slice(0, 1000); // Limite la longueur
};

/**
 * Valide et nettoie une URL
 */
export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') {
    return '';
  }

  try {
    const parsedUrl = new URL(url);

    // Autorise seulement http/https et les URLs relatives
    if (!['http:', 'https:'].includes(parsedUrl.protocol) && !url.startsWith('/')) {
      return '';
    }

    return url;
  } catch {
    return '';
  }
};

/**
 * Valide et nettoie un email
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') {
    return '';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleanEmail = email.trim().toLowerCase();

  return emailRegex.test(cleanEmail) ? cleanEmail : '';
};

/**
 * Échappe les caractères spéciaux pour les attributs HTML
 */
export const escapeHtmlAttribute = (text: string): string => {
  return text
    .replace(/&/g, '&')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '<')
    .replace(/>/g, '>');
};

/**
 * Génère un ID sécurisé pour les éléments DOM
 */
export const generateSecureId = (): string => {
  return `id_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Valide et nettoie un nom d'utilisateur
 */
export const sanitizeUsername = (username: string): string => {
  if (typeof username !== 'string') {
    return '';
  }

  return username
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '') // Garde seulement les caractères alphanumériques, _ et -
    .slice(0, 50); // Limite la longueur
};

/**
 * Valide et nettoie un nombre
 */
export const sanitizeNumber = (
  value: string | number,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return min;
  }

  return Math.max(min, Math.min(max, num));
};
