import React, { useState } from 'react';

import { Button, TextInput, Select, Checkbox } from 'flowbite-react';
import { FaMagnifyingGlass, FaChevronDown, FaChevronUp } from 'react-icons/fa6';
import {
  SearchCriteria,
  BookSearchCriteria,
  ArticleSearchCriteria,
  AppMode,
} from '../../types/AppMode.tsx';

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  currentMode: AppMode;
  onAdvancedSearchChange: (criteria: SearchCriteria) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  search,
  onSearchChange,
  placeholder,
  currentMode,
  onAdvancedSearchChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedCriteria, setAdvancedCriteria] = useState<SearchCriteria>({});

  const handleAdvancedChange = (field: string, value: any) => {
    const newCriteria = { ...advancedCriteria, [field]: value };
    setAdvancedCriteria(newCriteria);
    onAdvancedSearchChange(newCriteria);
  };

  const renderBookSearchFields = () => (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <TextInput
        placeholder="Titre"
        value={(advancedCriteria as BookSearchCriteria).title || ''}
        onChange={(e) => handleAdvancedChange('title', e.target.value)}
      />
      <TextInput
        placeholder="Auteur"
        value={(advancedCriteria as BookSearchCriteria).author || ''}
        onChange={(e) => handleAdvancedChange('author', e.target.value)}
      />
      <Select
        value={(advancedCriteria as BookSearchCriteria).type || ''}
        onChange={(e) => handleAdvancedChange('type', e.target.value)}
      >
        <option value="">Type</option>
        <option value="livre">Livre</option>
        <option value="carte topographique">Carte topographique</option>
      </Select>
      <Select
        value={(advancedCriteria as BookSearchCriteria).category || ''}
        onChange={(e) => handleAdvancedChange('category', e.target.value)}
      >
        <option value="">Catégorie</option>
        <option value="carte topographique">Carte topographique</option>
        <option value="topo randonnée">Topo randonnée</option>
        <option value="topo escalade">Topo escalade</option>
        <option value="topo alpinisme">Topo alpinisme</option>
        <option value="manuel technique">Manuel technique</option>
        <option value="beau livre">Beau livre</option>
        <option value="roman">Roman</option>
      </Select>
      <TextInput
        placeholder="Éditeur"
        value={(advancedCriteria as BookSearchCriteria).publisher || ''}
        onChange={(e) => handleAdvancedChange('publisher', e.target.value)}
      />
      <TextInput
        placeholder="Année de publication"
        type="number"
        value={(advancedCriteria as BookSearchCriteria).publication_year || ''}
        onChange={(e) =>
          handleAdvancedChange('publication_year', parseInt(e.target.value) || undefined)
        }
      />
      <TextInput
        placeholder="ISBN"
        value={(advancedCriteria as BookSearchCriteria).isbn || ''}
        onChange={(e) => handleAdvancedChange('isbn', e.target.value)}
      />
      <TextInput
        placeholder="Emplacement de stockage"
        value={(advancedCriteria as BookSearchCriteria).storage_location || ''}
        onChange={(e) => handleAdvancedChange('storage_location', e.target.value)}
      />
      <TextInput
        placeholder="Mots-clés"
        value={(advancedCriteria as BookSearchCriteria).keywords || ''}
        onChange={(e) => handleAdvancedChange('keywords', e.target.value)}
      />
    </div>
  );

  const renderArticleSearchFields = () => (
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      <TextInput
        placeholder="Désignation"
        value={(advancedCriteria as ArticleSearchCriteria).designation || ''}
        onChange={(e) => handleAdvancedChange('designation', e.target.value)}
      />
      <TextInput
        placeholder="Type"
        value={(advancedCriteria as ArticleSearchCriteria).type || ''}
        onChange={(e) => handleAdvancedChange('type', e.target.value)}
      />
      <TextInput
        placeholder="Couleur"
        value={(advancedCriteria as ArticleSearchCriteria).color || ''}
        onChange={(e) => handleAdvancedChange('color', e.target.value)}
      />
      <TextInput
        placeholder="Fabricant"
        value={(advancedCriteria as ArticleSearchCriteria).manufacturer || ''}
        onChange={(e) => handleAdvancedChange('manufacturer', e.target.value)}
      />
      <TextInput
        placeholder="Modèle"
        value={(advancedCriteria as ArticleSearchCriteria).model || ''}
        onChange={(e) => handleAdvancedChange('model', e.target.value)}
      />
      <Select
        value={(advancedCriteria as ArticleSearchCriteria).operational_status || ''}
        onChange={(e) => handleAdvancedChange('operational_status', e.target.value)}
      >
        <option value="">État opérationnel</option>
        <option value="excellent">Excellent</option>
        <option value="bon">Bon</option>
        <option value="acceptable">Acceptable</option>
        <option value="hors_service">Hors service</option>
      </Select>
      <TextInput
        placeholder="ID Fabricant"
        value={(advancedCriteria as ArticleSearchCriteria).manufacturer_id || ''}
        onChange={(e) => handleAdvancedChange('manufacturer_id', e.target.value)}
      />
      <TextInput
        placeholder="ID Club"
        value={(advancedCriteria as ArticleSearchCriteria).club_id || ''}
        onChange={(e) => handleAdvancedChange('club_id', e.target.value)}
      />
      <div className="flex items-center gap-2">
        <Checkbox
          id="is-epi"
          checked={(advancedCriteria as ArticleSearchCriteria).is_epi || false}
          onChange={(e) => handleAdvancedChange('is_epi', e.target.checked)}
        />
        <label htmlFor="is-epi">EPI</label>
      </div>
    </div>
  );

  return (
    <div className="search-container">
      <div className="flex flex-col">
        <div className="flex flex-row">
          <Button className="flex-none p-0">
            <FaMagnifyingGlass className="mr-2 h-5 w-5 text-blue-700" />
          </Button>
          <TextInput
            id="search1"
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            sizing="sm"
            className="flex-auto"
          />
        </div>
        <div></div>
        {/* <Button className="me-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          <FaMagnifyingGlass className="mr-2" />
          Rechercher
        </Button> */}
      </div>

      <div className="mt-4">
        <Button
          color="light"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex flex-auto items-center gap-2 focus:ring-0 focus:outline-1"
        >
          Recherche avancée
          {showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
        </Button>

        {showAdvanced && (
          <div className="rounded-lg p-0">
            {currentMode === 'books' ? renderBookSearchFields() : renderArticleSearchFields()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
