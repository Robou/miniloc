import * as React from 'react';
import { Card, Badge, Button } from 'flowbite-react';
import { Article, Book } from '@/types/AppMode';

interface ItemDetailsProps {
  item: Article | Book;
  currentMode: 'articles' | 'books';
  onAddToCart: (item: Article | Book) => void;
  isInCart: boolean;
}

const ItemDetails: React.FunctionComponent<ItemDetailsProps> = ({
  item,
  currentMode,
  onAddToCart,
  isInCart,
}) => {
  const renderField = (label: string, value: string | number | boolean | undefined) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div className="mb-3">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-900">{value}</dd>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <div className="mb-4 flex items-start justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {currentMode === 'articles' ? (item as Article).designation : (item as Book).title}
        </h2>
        <Badge color={item.available ? 'green' : 'red'}>
          {item.available ? 'Disponible' : 'Emprunté'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-semibold">Informations générales</h3>
          <dl className="space-y-2">
            {currentMode === 'articles' ? (
              <>
                {renderField('Type', (item as Article).type)}
                {renderField('Fabricant', (item as Article).manufacturer)}
                {renderField('Modèle', (item as Article).model)}
                {renderField('Taille', (item as Article).size)}
                {renderField('Couleur', (item as Article).color)}
                {renderField('État opérationnel', (item as Article).operational_status)}
                {renderField(
                  'Équipement de protection individuelle',
                  (item as Article).is_epi ? 'Oui' : 'Non'
                )}
                {renderField('Date de fabrication', (item as Article).manufacturing_date)}
                {renderField("Notes d'utilisation", (item as Article).usage_notes)}
              </>
            ) : (
              <>
                {renderField('Auteur', (item as Book).author)}
                {renderField('Éditeur', (item as Book).publisher)}
                {renderField('Année de publication', (item as Book).publication_year)}
                {renderField('ISBN', (item as Book).isbn)}
                {renderField('Type', (item as Book).type)}
                {renderField('Catégorie', (item as Book).category)}
                {renderField('Localisation de stockage', (item as Book).storage_location)}
                {renderField('Mots-clés', (item as Book).keywords)}
                {renderField('Description', (item as Book).description)}
              </>
            )}
          </dl>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">Actions</h3>
          <Button
            onClick={() => onAddToCart(item)}
            disabled={!item.available || isInCart}
            className="w-full"
            color={!item.available ? 'gray' : isInCart ? 'success' : 'blue'}
          >
            {!item.available ? 'Indisponible' : isInCart ? 'Ajouté au panier' : 'Ajouter au panier'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ItemDetails;
