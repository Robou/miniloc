import React, { useState } from 'react';
import { Article, Book, AppMode } from '../types/AppMode';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface AddItemFormProps {
  onAdd: (itemData: Partial<Article | Book>) => void;
  currentMode: AppMode;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAdd, currentMode }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    if (currentMode === 'articles') {
      if (formData.designation) {
        onAdd(formData);
        setFormData({});
      }
    } else {
      if (formData.title) {
        onAdd(formData);
        setFormData({});
      }
    }
  };

  const isValid = currentMode === 'articles' ? !!formData.designation : !!formData.title;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">
          <i className="fas fa-plus-circle mr-2"></i>
          Ajouter un nouveau {currentMode === 'articles' ? 'matériel' : 'livre'}
        </h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentMode === 'articles' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Désignation *
                </label>
                <Input
                  placeholder="Ex: Casque Petzl Boreo"
                  value={formData.designation || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Input
                  placeholder="Ex: casque, corde, baudrier..."
                  value={formData.type || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                <Input
                  placeholder="Ex: rouge, bleu..."
                  value={formData.color || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fabricant</label>
                <Input
                  placeholder="Ex: Petzl, Black Diamond..."
                  value={formData.manufacturer || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modèle</label>
                <Input
                  placeholder="Ex: Boreo, Momentum..."
                  value={formData.model || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taille</label>
                <Input
                  placeholder="Ex: M, L, XL..."
                  value={formData.size || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Fabricant</label>
                <Input
                  placeholder="Ex: PETZL001, BD002..."
                  value={formData.manufacturer_id || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, manufacturer_id: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Club</label>
                <Input
                  placeholder="Ex: CLUB001, CLUB002..."
                  value={formData.club_id || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, club_id: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Fabrication
                </label>
                <Input
                  placeholder="Ex: 2023-01-01"
                  value={formData.manufacturing_date || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, manufacturing_date: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut Opérationnel
                </label>
                <Input
                  placeholder="Ex: neuf, utilisé, en réparation..."
                  value={formData.operational_status || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, operational_status: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes d'Utilisation
                </label>
                <Input
                  placeholder="Ex: Utilisé pour l'escalade en falaise..."
                  value={formData.usage_notes || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, usage_notes: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">EPI</label>
                <Input
                  placeholder="Ex: true, false"
                  value={formData.is_epi || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, is_epi: e.target.value })
                  }
                  className="form-control"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <Input
                  placeholder="Titre du livre"
                  value={formData.title || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auteur</label>
                <Input
                  placeholder="Nom de l'auteur"
                  value={formData.author || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <Input
                  placeholder="Ex: Roman, Science-Fiction, Histoire..."
                  value={formData.category || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Éditeur</label>
                <Input
                  placeholder="Ex: Gallimard, Flammarion..."
                  value={formData.publisher || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, publisher: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année de Publication
                </label>
                <Input
                  placeholder="Ex: 2023"
                  value={formData.publication_year || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, publication_year: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Input
                  placeholder="Ex: Un livre sur l'histoire de l'alpinisme..."
                  value={formData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mots-clés</label>
                <Input
                  placeholder="Ex: alpinisme, montagne, escalade..."
                  value={formData.keywords || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                <Input
                  placeholder="Ex: 978-3-16-148410-0"
                  value={formData.isbn || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, isbn: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Input
                  placeholder="Ex: Livre, Magazine, Revue..."
                  value={formData.type || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emplacement de Stockage
                </label>
                <Input
                  placeholder="Ex: Étagère A, Rayon B..."
                  value={formData.storage_location || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, storage_location: e.target.value })
                  }
                  className="form-control"
                />
              </div>
            </>
          )}
        </div>
        <Button onClick={handleSubmit} disabled={!isValid} className="mt-4 btn-primary">
          <i className="fas fa-plus-circle mr-2"></i>
          Ajouter {currentMode === 'articles' ? 'le matériel' : 'le livre'}
        </Button>
      </div>
    </div>
  );
};

export default AddItemForm;
