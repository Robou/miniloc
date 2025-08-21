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
  return (
    <div className="fade-in">
      <div className="card max-w-md mx-auto">
        <div className="card-header">
          <h2 className="text-xl font-bold">
            <i className="fas fa-lock mr-2"></i>
            Connexion Administrateur
          </h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
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
            <Button onClick={onLogin} className="w-full btn-primary">
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
