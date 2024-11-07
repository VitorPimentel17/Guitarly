import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { extractToken } from './utils/extractToken';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  user: { id: string | null, username: string | null, admin: boolean };
  setUser: (user: { id: string | null, username: string | null, admin: boolean }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ id: string | null, username: string | null, admin: boolean }>({ id: null, username: null, admin: false });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const extractedUser = extractToken(token);
      setUser({ ...extractedUser, admin: extractedUser.admin || false });
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};