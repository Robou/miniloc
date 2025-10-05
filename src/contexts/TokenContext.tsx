import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { checkClubToken } from '../utils/tokenUtils';

interface TokenContextType {
  isTokenValid: boolean;
  isLoading: boolean;
  checkToken: () => Promise<void>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkToken = async () => {
    setIsLoading(true);
    try {
      const valid = await checkClubToken();
      setIsTokenValid(valid);
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      setIsTokenValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  const value: TokenContextType = {
    isTokenValid,
    isLoading,
    checkToken,
  };

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
};

export const useToken = (): TokenContextType => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};
