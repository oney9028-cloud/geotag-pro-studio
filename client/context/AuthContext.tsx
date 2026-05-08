'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import SignInModal from '@/components/Auth/SignInModal';
import { signIn } from 'next-auth/react';

interface AuthContextType {
  openSignIn: () => void;
  closeSignIn: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openSignIn = () => setIsModalOpen(true);
  const closeSignIn = () => setIsModalOpen(false);

  return (
    <AuthContext.Provider value={{ openSignIn, closeSignIn }}>
      {children}
      <SignInModal 
        isOpen={isModalOpen} 
        onClose={closeSignIn} 
        onSignIn={(provider, options) => signIn(provider, options)}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
