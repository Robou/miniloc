import React from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface LoginTabProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
}

const LoginTab: React.FC<LoginTabProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onLogin,
}) => {
  const adminFeatures = [
    "Sélection d'un ou des deux modes : bibliothèque ou location de matériel",
    "Ajout/édition d'articles",
    "Import par lots d'un grand nombre d'articles par fichier CSV",
  ];
  return (
    <div className="fade-in">
      <div className="admin-description mb-4 rounded bg-gray-100 p-3">
        <h3 className="mb-2 font-semibold">
          Fonctionnalités actuelles de l'interface administrateur :
        </h3>
        <ul className="list-inside list-disc">
          {adminFeatures.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
      <div className="card mx-auto max-w-md">
        <div className="card-header">
          <h2 className="text-xl font-bold">
            <i className="fas fa-lock mr-2"></i>
            Connexion Administrateur
          </h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email administrateur
              </label>
              <Input
                placeholder="admin@exemple.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEmailChange(e.target.value)}
                className="form-control"
                type="email"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onPasswordChange(e.target.value)
                }
                className="form-control"
              />
            </div>
            <Button onClick={onLogin} className="btn-primary w-full">
              <i className="fas fa-sign-in-alt mr-2"></i>
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginTab;
