import React, { useState } from 'react';
import {
  Article,
  Book,
  SearchCriteria,
  BookSearchCriteria,
  ArticleSearchCriteria,
} from '../types/AppMode.tsx';
import ItemCard from './ui/ItemCard.tsx';
import SearchBar from './ui/SearchBar.tsx';

interface CatalogProps {
  items: (Article | Book)[];
  search: string;
  onSearchChange: (value: string) => void;
  cart: (Article | Book)[];
  onAddToCart: (item: Article | Book) => void;
  currentMode: 'articles' | 'books';
}

const Catalog: React.FC<CatalogProps> = ({
  items,
  search,
  onSearchChange,
  cart,
  onAddToCart,
  currentMode,
}) => {
  const [advancedCriteria, setAdvancedCriteria] = useState<SearchCriteria>({});

  const matchesCriteria = (item: Article | Book, criteria: SearchCriteria): boolean => {
    if (currentMode === 'books') {
      const book = item as Book;
      const bookCriteria = criteria as BookSearchCriteria;

      // Recherche simple (rétrocompatibilité)
      if (search && !book.title?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Critères avancés pour les livres
      if (
        bookCriteria.title &&
        !book.title?.toLowerCase().includes(bookCriteria.title.toLowerCase())
      ) {
        return false;
      }
      if (
        bookCriteria.author &&
        !book.author?.toLowerCase().includes(bookCriteria.author.toLowerCase())
      ) {
        return false;
      }
      if (bookCriteria.type && book.type !== bookCriteria.type) {
        return false;
      }
      if (bookCriteria.category && book.category !== bookCriteria.category) {
        return false;
      }
      if (
        bookCriteria.publisher &&
        !book.publisher?.toLowerCase().includes(bookCriteria.publisher.toLowerCase())
      ) {
        return false;
      }
      if (
        bookCriteria.publication_year &&
        book.publication_year !== bookCriteria.publication_year
      ) {
        return false;
      }
      if (
        bookCriteria.isbn &&
        !book.isbn?.toLowerCase().includes(bookCriteria.isbn.toLowerCase())
      ) {
        return false;
      }
      if (
        bookCriteria.storage_location &&
        !book.storage_location?.toLowerCase().includes(bookCriteria.storage_location.toLowerCase())
      ) {
        return false;
      }
      if (
        bookCriteria.keywords &&
        !book.keywords?.toLowerCase().includes(bookCriteria.keywords.toLowerCase())
      ) {
        return false;
      }
    } else {
      const article = item as Article;
      const articleCriteria = criteria as ArticleSearchCriteria;

      // Recherche simple (rétrocompatibilité)
      if (search && !article.designation?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Critères avancés pour les articles
      if (
        articleCriteria.designation &&
        !article.designation?.toLowerCase().includes(articleCriteria.designation.toLowerCase())
      ) {
        return false;
      }
      if (
        articleCriteria.type &&
        !article.type?.toLowerCase().includes(articleCriteria.type.toLowerCase())
      ) {
        return false;
      }
      if (
        articleCriteria.color &&
        !article.color?.toLowerCase().includes(articleCriteria.color.toLowerCase())
      ) {
        return false;
      }
      if (
        articleCriteria.manufacturer &&
        !article.manufacturer?.toLowerCase().includes(articleCriteria.manufacturer.toLowerCase())
      ) {
        return false;
      }
      if (
        articleCriteria.model &&
        !article.model?.toLowerCase().includes(articleCriteria.model.toLowerCase())
      ) {
        return false;
      }
      if (
        articleCriteria.operational_status &&
        article.operational_status !== articleCriteria.operational_status
      ) {
        return false;
      }
      if (
        articleCriteria.manufacturer_id &&
        !article.manufacturer_id
          ?.toLowerCase()
          .includes(articleCriteria.manufacturer_id.toLowerCase())
      ) {
        return false;
      }
      if (
        articleCriteria.club_id &&
        !article.club_id?.toLowerCase().includes(articleCriteria.club_id.toLowerCase())
      ) {
        return false;
      }
      if (articleCriteria.is_epi !== undefined && article.is_epi !== articleCriteria.is_epi) {
        return false;
      }
    }

    return true;
  };

  const filteredItems = items.filter((item) => {
    // Si des critères avancés sont définis, les utiliser
    if (Object.keys(advancedCriteria).length > 0) {
      return matchesCriteria(item, advancedCriteria);
    }

    // Sinon, utiliser la recherche simple (rétrocompatibilité)
    const searchField =
      currentMode === 'articles' ? (item as Article).designation || '' : (item as Book).title || '';
    return searchField.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="fade-in">
      <SearchBar
        search={search}
        onSearchChange={onSearchChange}
        placeholder={`Rechercher un ${currentMode === 'articles' ? 'article' : 'livre'}...`}
        currentMode={currentMode}
        onAdvancedSearchChange={setAdvancedCriteria}
      />

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const isInCart = !!cart.find((a) => a.id === item.id);
            return (
              <ItemCard
                key={item.id}
                item={item}
                isInCart={isInCart}
                onAddToCart={onAddToCart}
                currentMode={currentMode}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <i className="fas fa-search mb-4 text-6xl text-gray-300"></i>
          <p className="text-lg text-gray-500">
            Aucun {currentMode === 'articles' ? 'article' : 'livre'} trouvé
          </p>
        </div>
      )}
    </div>
  );
};

export default Catalog;
