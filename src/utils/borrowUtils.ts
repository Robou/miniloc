import supabase from '../lib/supabase';
import { Article, Book, AppMode, MODE_CONFIGS } from '../types/AppMode';
import toast from 'react-hot-toast';
import { confirmation } from '../components/ui/Confirm';

interface BorrowerInfo {
  name: string;
  email: string;
  rental_price: string;
  supervisor_name: string;
}

export const confirmBorrow = async (
  cart: (Article | Book)[],
  borrower: BorrowerInfo,
  currentMode: AppMode,
  fetchArticles: () => Promise<void>,
  fetchBorrows: () => Promise<void>
): Promise<void> => {
  const errors: string[] = [];
  const currentConfig = MODE_CONFIGS[currentMode];

  for (const item of cart) {
    const params: Record<string, string | number | null> = {
      [`p_${currentConfig.itemIdField.replace('_id', '')}_id`]: item.id,
      p_name: borrower.name,
      p_email: borrower.email || null,
    };

    // Ajouter les champs spécifiques au matériel de montagne
    if (currentMode === 'articles') {
      if (borrower.rental_price) {
        params.p_rental_price = parseFloat(borrower.rental_price);
      }
      if (borrower.supervisor_name) {
        params.p_supervisor_name = borrower.supervisor_name;
      }
    }

    const { data, error } = await supabase.rpc(currentConfig.createFunction, params);

    const itemName =
      currentMode === 'articles'
        ? (item as Article).designation || 'Article'
        : (item as Book).title;

    if (error) {
      errors.push(`Erreur technique pour ${itemName}: ${error.message}`);
      toast.error(`Erreur technique pour ${itemName}: ${error.message}`);
      continue;
    }

    if (!data.success) {
      errors.push(`${itemName}: ${data.error}`);
      continue;
    }
  }

  if (errors.length > 0) {
    toast.error(
      `Erreurs lors de l'emprunt:\n${errors.join('\n')}\n\nVeuillez corriger les informations et réessayer.`
    );
    return;
  }

  toast.success('Emprunt réalisé avec succès !');
  await fetchArticles();
  await fetchBorrows();
};

export const returnItem = async (
  borrowId: number,
  currentMode: AppMode,
  fetchArticles: () => Promise<void>,
  fetchBorrows: () => Promise<void>
): Promise<void> => {
  const currentConfig = MODE_CONFIGS[currentMode];
  const itemType = currentMode === 'articles' ? 'article' : 'livre';

  const result = await confirmation({
    message: 'Êtes-vous sûr de vouloir retourner cet ${itemType} ?',
  });

  if (!result) {
    // User confirmed - proceed with deletion
    return;
  }

  // if (!confirm(`Êtes-vous sûr de vouloir retourner cet ${itemType} ?`)) {
  //   return;
  // }

  const { data, error } = await supabase.rpc(currentConfig.returnFunction, {
    p_borrow_id: borrowId,
  });

  if (error) {
    toast.error(`Erreur technique lors du retour: ${error.message}`);
    return;
  }

  if (!data.success) {
    toast.error(`Erreur lors du retour: ${data.error}`);
    return;
  }

  toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} retourné avec succès !`);
  await fetchArticles();
  await fetchBorrows();
};
