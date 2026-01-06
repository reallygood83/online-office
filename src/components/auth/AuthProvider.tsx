'use client';

import { useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, getUserData, signOut } from '@/lib/firebase/auth';
import { User } from '@/types';
import { AuthContext } from '@/lib/hooks/useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        const userData = await getUserData(fbUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
