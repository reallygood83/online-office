'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const isVerifyPage = pathname === '/admin/verify';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !user.isAdmin && !isVerifyPage) {
      router.push('/admin/verify');
    }
  }, [user, loading, router, isVerifyPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFE]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚙️</div>
          <p className="font-bold text-xl">관리자 페이지 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isVerifyPage) {
    return <>{children}</>;
  }

  if (!user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      <Header
        user={{ displayName: user.displayName, isAdmin: user.isAdmin }}
        onLogout={logout}
      />
      <div className="flex">
        <Sidebar isAdmin={true} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
