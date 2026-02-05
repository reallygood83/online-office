'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { TeacherNamesProvider } from '@/lib/hooks/useTeacherNames';
import { Header } from '@/components/layout/Header';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFE]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏫</div>
          <p className="font-bold text-xl">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <TeacherNamesProvider>
      <div className="min-h-screen bg-[#FEFEFE]">
        <Header
          user={{ uid: user.uid, displayName: user.displayName, isAdmin: user.isAdmin }}
          onLogout={logout}
        />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </TeacherNamesProvider>
  );
}
