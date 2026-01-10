'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { verifyAdminCode, setUserAsAdmin } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminVerifyPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !user) return;

    setVerifying(true);
    setError('');

    try {
      const isValid = await verifyAdminCode(code.trim());
      
      if (isValid) {
        await setUserAsAdmin(user.uid, {
          email: user.email,
          displayName: user.displayName,
        });
        await refreshUser();
        router.push('/admin');
      } else {
        setError('관리자 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setError('인증 중 오류가 발생했습니다.');
    }

    setVerifying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFE]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔐</div>
          <p className="font-bold text-xl">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (user.isAdmin) {
    router.push('/admin');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFEFE] p-4">
      <Card className="w-full max-w-md bg-[#FF6B6B]/10">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <CardTitle className="text-2xl">관리자 인증</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 mb-6">
            관리자 페이지에 접근하려면<br />
            관리자 비밀번호를 입력하세요.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label="관리자 비밀번호"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoFocus
            />

            {error && (
              <div className="p-3 bg-red-100 border-2 border-red-400 rounded-lg">
                <p className="text-red-600 text-sm font-bold">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={verifying || !code.trim()}
              className="w-full"
            >
              {verifying ? '인증 중...' : '🔓 관리자 인증'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-100 rounded-lg border-2 border-yellow-400">
            <p className="text-sm text-center">
              <span className="font-bold">💡 안내</span><br />
              관리자 비밀번호는 기존 관리자에게 문의하세요.
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              대시보드로 돌아가기
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
