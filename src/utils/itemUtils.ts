import toast from 'react-hot-toast';
import supabase from '../lib/supabase';
import { Article, Book, AppMode, MODE_CONFIGS } from '../types/AppMode';

export const addItemToDB = async (
  itemData: Partial<Article | Book>,
  currentMode: AppMode,
  fetchArticles: () => Promise<void>
): Promise<void> => {
  const currentConfig = MODE_CONFIGS[currentMode];
  const { error } = await supabase.from(currentConfig.tableName).insert(itemData);

  if (error) {
    if (error.code === 'PGRST116' || error.details?.includes('400')) {
      console.error('Erreur 400 - Requête invalide:', error.message);
      toast.error('Erreur 400 - Requête invalide:' + error.message);
    }
    console.error("Erreur lors de l'ajout:", error);
    toast.error("Erreur lors de l'ajout: " + error.message);
    return;
  }

  await fetchArticles();
  toast.success('Élément ajouté avec succès !');
};

// export const editItemToDB = async (
//   itemData: Partial<Article | Book>,
//   currentMode: AppMode,
//   fetchArticles: () => Promise<void>
// ): Promise<void> => {
//   const currentConfig = MODE_CONFIGS[currentMode];
//   const { error } = await supabase.from(currentConfig.tableName).update(itemData);
//   if (!error) await fetchArticles();
// };
