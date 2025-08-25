import supabase from '../lib/supabase';
import { Article, Book, AppMode, MODE_CONFIGS } from '../types/AppMode';

export const addItem = async (
  itemData: Partial<Article | Book>,
  currentMode: AppMode,
  fetchArticles: () => Promise<void>
): Promise<void> => {
  const currentConfig = MODE_CONFIGS[currentMode];
  const { error } = await supabase.from(currentConfig.tableName).insert(itemData);
  if (!error) await fetchArticles();
};
