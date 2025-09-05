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
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox' | 'date';
  required: boolean;
  options?: string[];
}

const AdaptiveItemForm: React.FC<AdaptiveItemFormProps> = ({
  currentMode,
  onSubmit,
  initialData = {},
}) => {
  const isEdit = !!initialData.id;

  // Process initialData for display
  const processedInitialData = React.useMemo(() => {
    const data = { ...initialData };
    if (currentMode === 'articles' && (data as any).manufacturing_date) {
      const date = new Date((data as any).manufacturing_date);
      (data as any).manufacturing_date =
        `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
    return data;
  }, [initialData, currentMode]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    defaultValues: { available: true, ...processedInitialData },
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
          label: 'Date de fabrication (MM/YYYY)',
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

  // Reset form when mode or initialData changes
  useEffect(() => {
    reset({ available: true, ...processedInitialData });
  }, [processedInitialData, reset]);

  const renderField = (field: FieldConfig) => {
    const validationRules: any = { required: field.required };
    if (field.name === 'manufacturing_date') {
      validationRules.pattern = {
        value: /^\d{2}\/\d{4}$/,
        message: 'Format attendu: MM/YYYY (ex: 12/2023)',
      };
    }
    const baseProps = {
      ...register(field.name, validationRules),
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none"
            rows={3}
            placeholder={field.label}
          />
        );

      case 'select':
        return (
          <select {...baseProps} className="w-full rounded border p-2">
            {!field.required && <option value="">Sélectionner {field.label}</option>}
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
            className="w-full rounded border p-2"
            placeholder={field.label}
          />
        );

      case 'date':
        return (
          <input
            {...baseProps}
            type="date"
            className="w-full rounded border p-2"
            placeholder={field.label}
          />
        );

      case 'checkbox':
        return (
          <input
            {...baseProps}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        );

      default:
        return (
          <input
            {...baseProps}
            type="text"
            className="w-full rounded border p-2"
            placeholder={field.label}
          />
        );
    }
  };

  const handleFormSubmit = async (data: any) => {
    // Nettoyer les données : supprimer les champs vides
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        // Convertir les nombres
        if (key === 'publication_year' && typeof value === 'string') {
          acc[key] = parseInt(value, 10);
        } else if (key === 'manufacturing_date' && typeof value === 'string') {
          // Convertir MM/YYYY en date (premier jour du mois)
          const [month, year] = value.split('/');
          if (month && year) {
            const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
            acc[key] = date.toISOString().split('T')[0]; // YYYY-MM-DD
          } else {
            acc[key] = value; // Si format invalide, garder tel quel
          }
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {} as any);

    // Ajouter les champs requis
    const itemData = {
      ...cleanedData,
      available: data.available || true,
      created_at: new Date().toISOString(),
    };

    await onSubmit(itemData);
    // Reset all fields to empty values
    const emptyValues = Object.fromEntries(
      fields.map((f) => [f.name, f.type === 'checkbox' ? false : ''])
    );
    reset({ available: true, ...emptyValues });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">
          <i className={`fas fa-${isEdit ? 'edit' : 'plus'} mr-2`}></i>
          {isEdit ? 'Modifier' : 'Ajouter'} {currentMode === 'books' ? 'un livre' : 'un article'}
        </h3>
      </div>

      <div className="card-body">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.name}
              className={`${field.type === 'checkbox' ? 'col-span-full flex items-center space-x-2' : field.type === 'textarea' ? 'col-span-full' : ''}`}
            >
              <label
                className={`block text-sm font-medium ${field.type === 'checkbox' ? 'order-2' : 'mb-1'}`}
              >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {renderField(field)}
              {(errors as any)[field.name] && (
                <p className="mt-1 text-sm text-red-500">
                  {(errors as any)[field.name]?.message || 'Ce champ est requis'}
                </p>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
            className="btn btn-primary col-span-full mt-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="fas fa-plus mr-2"></i>
            {isSubmitting
              ? `${isEdit ? 'Modification' : 'Ajout'} en cours...`
              : `${isEdit ? 'Modifier' : 'Ajouter'} ${currentMode === 'books' ? 'le livre' : "l'article"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveItemForm;
