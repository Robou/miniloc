// Type pour les livres
export type Book = {
  id: number;
  title: string;
  author?: string;
  category?: string;
  publisher?: string;
  publication_year?: number;
  description?: string;
  keywords?: string;
  isbn?: string;
  type?: string;
  storage_location?: string;
  available: boolean;
  created_at: string;
};

// Type pour les articles (matériel de montagne)
export type Article = {
  id: number;
  // Champs existants
  type?: string;
  available: boolean;
  created_at?: string;
  // Nouveaux champs pour le matériel de montagne
  designation?: string;
  is_epi?: boolean;
  color?: string;
  manufacturer?: string;
  model?: string;
  size?: string;
  manufacturer_id?: string;
  club_id?: string;
  manufacturing_date?: string;
  operational_status?: string;
  usage_notes?: string;
};

export type BookBorrow = {
  id: number;
  book_id: number;
  name: string;
  email?: string;
  borrowed_at: string;
  book: Book;
};

export type ArticleBorrow = {
  id: number;
  equipment_id: number;
  name: string;
  email?: string;
  borrowed_at: string;
  // Nouveaux champs pour les emprunts de matériel
  rental_price?: number;
  supervisor_name?: string;
  equipment: Article;
};

// Types pour la recherche multicritères
export type BookSearchCriteria = {
  title?: string;
  author?: string;
  type?: 'livre' | 'carte topographique';
  category?:
    | 'carte topographique'
    | 'topo randonnée'
    | 'topo escalade'
    | 'topo alpinisme'
    | 'manuel technique'
    | 'beau livre'
    | 'roman';
  publisher?: string;
  publication_year?: number;
  isbn?: string;
  storage_location?: string;
  keywords?: string;
};

export type ArticleSearchCriteria = {
  designation?: string;
  type?: string;
  color?: string;
  manufacturer?: string;
  model?: string;
  operational_status?: 'excellent' | 'bon' | 'acceptable' | 'hors_service';
  manufacturer_id?: string;
  club_id?: string;
  is_epi?: boolean;
};

export type SearchCriteria = BookSearchCriteria | ArticleSearchCriteria;

// Configuration des modes
export type AppMode = 'articles' | 'books';
type ModeConfig = {
  name: string;
  icon: string;
  tableName: string;
  borrowTableName: string;
  itemIdField: string;
  displayField: string;
  createFunction: string;
  returnFunction: string;
};

export const MODE_CONFIGS: Record<AppMode, ModeConfig> = {
  articles: {
    name: 'Matériel de montagne',
    icon: 'fas fa-mountain',
    tableName: 'equipment', // Utilise la nouvelle table equipment
    borrowTableName: 'equipment_borrows',
    itemIdField: 'equipment_id',
    displayField: 'designation',
    createFunction: 'create_equipment_borrow',
    returnFunction: 'return_equipment',
  },
  books: {
    name: 'Bibliothèque',
    icon: 'fas fa-book',
    tableName: 'books',
    borrowTableName: 'book_borrows',
    itemIdField: 'book_id',
    displayField: 'title',
    createFunction: 'create_book_borrow',
    returnFunction: 'return_book',
  },
};
