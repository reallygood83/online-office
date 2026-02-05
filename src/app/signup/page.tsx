'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFE]">
        <div className="text-6xl animate-bounce">🏫</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFEFE] p-4">
      <SignupForm />
    </div>
  );
}
