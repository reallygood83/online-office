'use client';

import { useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { subscribeToAuthState, getCurrentUserData, signOut } from '@/lib/firebase/auth';
import { User } from '@/types';
import { AuthContext } from '@/lib/hooks/useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const userData = await getCurrentUserData(fbUser.uid);
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

  const refreshUser = async () => {
    if (firebaseUser) {
      const userData = await getCurrentUserData(firebaseUser.uid);
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
