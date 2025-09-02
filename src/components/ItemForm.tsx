import React, { useEffect } from 'react';
import { Article, Book, AppMode } from '../types/AppMode';
import { useForm } from 'react-hook-form';

interface AdaptiveItemFormProps {
  onSubmit: (itemData: Partial<Article | Book>) => void;
  currentMode: AppMode;
  initialData?: Partial<Article | Book>;
}

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox';
  required: boolean;
  options?: string[];
}

const AdaptiveItemForm: React.FC<AdaptiveItemFormProps> = ({
  currentMode,
  onSubmit,
  initialData = {},
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { available: true, ...initialData },
  });

  // Configuration des champs selon le type
  const getFieldConfig = (mode: 'articles' | 'books'): FieldConfig[] => {
    const configs = {
      books: [
        { name: 'title', label: 'Titre', type: 'text' as const, required: true },
        { name: 'author', label: 'Auteur', type: 'text' as const, required: false },
        {
          name: 'category',
          label: 'Catégorie',
          type: 'select' as const,
          options: [
            'carte topographique',
            'topo randonnée',
            'topo escalade',
            'topo alpinisme',
            'manuel technique',
            'beau livre',
            'roman',
          ],
          required: false,
        },
        { name: 'publisher', label: 'Éditeur', type: 'text' as const, required: false },
        {
          name: 'publication_year',
          label: 'Année de publication',
          type: 'number' as const,
          required: false,
        },
        { name: 'isbn', label: 'ISBN', type: 'text' as const, required: false },
        { name: 'description', label: 'Description', type: 'textarea' as const, required: false },
        { name: 'keywords', label: 'Mots-clés', type: 'text' as const, required: false },
        {
          name: 'type',
          label: 'Type',
          type: 'select' as const,
          options: ['livre', 'carte topographique'],
          required: false,
        },
        {
          name: 'storage_location',
          label: 'Lieu de stockage',
          type: 'text' as const,
          required: false,
        },
      ],
      articles: [
        { name: 'designation', label: 'Désignation', type: 'text' as const, required: true },
        {
          name: 'type',
          label: 'Type',
          type: 'select' as const,
          options: ['Corde', 'Mousqueton', 'Casque', 'Baudrier', 'Chaussures', 'Autre'],
          required: false,
        },
        { name: 'manufacturer', label: 'Fabricant', type: 'text' as const, required: false },
        { name: 'model', label: 'Modèle', type: 'text' as const, required: false },
        { name: 'size', label: 'Taille', type: 'text' as const, required: false },
        { name: 'color', label: 'Couleur', type: 'text' as const, required: false },
        { name: 'manufacturer_id', label: 'ID Fabricant', type: 'text' as const, required: false },
        { name: 'club_id', label: 'ID Club', type: 'text' as const, required: false },
        {
          name: 'manufacturing_date',
          label: 'Date de fabrication',
          type: 'text' as const,
          required: false,
        },
        {
          name: 'operational_status',
          label: 'État opérationnel',
          type: 'select' as const,
          options: ['excellent', 'bon', 'acceptable', 'hors_service'],
          required: false,
        },
        {
          name: 'usage_notes',
          label: "Notes d'utilisation",
          type: 'textarea' as const,
          required: false,
        },
        {
          name: 'is_epi',
          label: 'EPI (Équipement de Protection Individuelle)',
          type: 'checkbox' as const,
          required: false,
        },
      ],
    };
    return configs[mode];
  };

  const fields = getFieldConfig(currentMode);

  // Reset form when itemType changes
  useEffect(() => {
    reset({});
  }, [currentMode, reset]);

  const renderField = (field: FieldConfig) => {
    const baseProps = {
      ...register(field.name, { required: field.required }),
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
            rows={3}
            placeholder={field.label}
          />
        );

      case 'select':
        return (
          <select {...baseProps} className="w-full p-2 border rounded">
            <option value="">Sélectionner {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            {...baseProps}
            type="number"
            className="w-full p-2 border rounded"
            placeholder={field.label}
          />
        );

      case 'checkbox':
        return (
          <input
            {...baseProps}
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );

      default:
        return (
          <input
            {...baseProps}
            type="text"
            className="w-full p-2 border rounded"
            placeholder={field.label}
          />
        );
    }
  };

  const handleFormSubmit = (data: any) => {
    // Nettoyer les données : supprimer les champs vides
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    // Ajouter les champs requis
    const itemData = {
      ...cleanedData,
      available: data.available || true,
      created_at: new Date().toISOString(),
    };

    onSubmit(itemData);
    reset({ available: true }); // Reset avec available à true par défaut
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">
          <i className="fas fa-plus mr-2"></i>
          Ajouter {currentMode === 'books' ? 'un livre' : 'un article'}
        </h3>
      </div>

      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div
              key={field.name}
              className={`${field.type === 'checkbox' ? 'flex items-center space-x-2 col-span-full' : field.type === 'textarea' ? 'col-span-full' : ''}`}
            >
              <label
                className={`block text-sm font-medium ${field.type === 'checkbox' ? 'order-2' : 'mb-1'}`}
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">Ce champ est requis</p>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleSubmit(handleFormSubmit)}
            className="btn btn-primary col-span-full mt-4"
          >
            <i className="fas fa-plus mr-2"></i>
            Ajouter {currentMode === 'books' ? 'le livre' : "l'article"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveItemForm;
