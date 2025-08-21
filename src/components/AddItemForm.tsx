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
