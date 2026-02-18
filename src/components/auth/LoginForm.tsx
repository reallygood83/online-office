'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signInWithGoogle } from '@/lib/firebase/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
        'auth/user-not-found': '등록되지 않은 이메일입니다.',
        'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
        'auth/too-many-requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
      };
      setError(errorMessages[err.code] || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle(password || undefined);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'auth/popup-closed-by-user': '구글 로그인 창이 닫혔습니다. 다시 시도해주세요.',
        'auth/popup-blocked': '브라우저에서 팝업이 차단되었습니다. 팝업을 허용해주세요.',
        'auth/requires-password-for-google-link': '기존 이메일 계정이 있습니다. 비밀번호 입력 후 구글 로그인을 다시 눌러주세요.',
        'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
      };
      setError(errorMessages[err.code] || err.message || '구글 로그인에 실패했습니다.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">🏫 로그인</CardTitle>
        <p className="text-center text-gray-600 mt-2">박달초등학교 교직원 포털</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="이메일"
            placeholder="example@school.go.kr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            label="비밀번호"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && (
            <div className="neo-card bg-[#FF6B6B]/10 border-[#FF6B6B] p-3 rounded-lg">
              <p className="text-[#FF6B6B] font-semibold text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || googleLoading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>

          <div className="text-center text-sm text-gray-500">또는</div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={loading || googleLoading}
            onClick={handleGoogleLogin}
          >
            {googleLoading ? '구글 로그인 중...' : 'Google로 로그인'}
          </Button>

          <div className="text-center pt-4 border-t-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/signup" className="font-bold text-[#4ECDC4] hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
