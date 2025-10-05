import supabase from '../lib/supabase';

/**
 * Vérifie la validité du token club_token
 * Logique : si pas de token local → invalide
 * Si token local présent → compare avec Supabase
 */
export const checkClubToken = async (): Promise<boolean> => {
  try {
    // Récupérer le token du local storage
    const localToken = localStorage.getItem('club_token');

    // Si pas de token local → invalide immédiatement
    if (!localToken) {
      console.log('Aucun token club_token trouvé en local storage');
      return false;
    }

    // Récupérer le token de Supabase depuis la table config
    const { data, error } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'club_token')
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du token Supabase:', error);
      return false;
    }

    if (!data?.value) {
      console.error('Aucun token trouvé dans la table config de Supabase');
      return false;
    }

    // Comparer les tokens
    const isValid = localToken === data.value;

    if (isValid) {
      console.log('Token club_token valide');
    } else {
      console.log('Token club_token invalide');
    }

    return isValid;
  } catch (error) {
    console.error('Erreur inattendue lors de la vérification du token:', error);
    return false;
  }
};

/**
 * Récupère le token du local storage sans vérification
 */
export const getLocalToken = (): string | null => {
  return localStorage.getItem('club_token');
};

/**
 * Définit le token dans le local storage
 */
export const setLocalToken = (token: string): void => {
  localStorage.setItem('club_token', token);
};

/**
 * Supprime le token du local storage
 */
export const removeLocalToken = (): void => {
  localStorage.removeItem('club_token');
};

/**
 * Récupère le token club depuis Supabase et le stocke dans le local storage
 * Permet de déclarer que ce navigateur est l'ordinateur autorisé du club
 */
export const authorizeClubComputer = async (): Promise<boolean> => {
  try {
    // Récupérer le token de Supabase depuis la table config
    const { data, error } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'club_token')
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du token Supabase:', error);
      return false;
    }

    if (!data?.value) {
      console.error('Aucun token trouvé dans la table config de Supabase');
      return false;
    }

    // Stocker le token dans le local storage
    setLocalToken(data.value);
    console.log('Token club copié dans le local storage - ordinateur autorisé');

    return true;
  } catch (error) {
    console.error("Erreur lors de l'autorisation de l'ordinateur club:", error);
    return false;
  }
};

/**
 * Désautorise l'ordinateur club en supprimant le token du local storage
 */
export const deauthorizeClubComputer = (): void => {
  removeLocalToken();
  console.log('Token club supprimé du local storage - ordinateur désautorisé');
};
