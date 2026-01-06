'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp, verifySpecialCode } from '@/lib/firebase/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<'code' | 'register'>('code');
  const [specialCode, setSpecialCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isValid = await verifySpecialCode(specialCode);
      if (isValid) {
        setStep('register');
      } else {
        setError('유효하지 않은 특별코드입니다.');
      }
    } catch (err) {
      setError('코드 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, displayName);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
        'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
        'auth/weak-password': '비밀번호가 너무 약합니다.',
      };
      setError(errorMessages[err.code] || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">🏫 회원가입</CardTitle>
        <p className="text-center text-gray-600 mt-2">
          {step === 'code' ? '특별코드를 입력해주세요' : '계정 정보를 입력해주세요'}
        </p>
      </CardHeader>
      <CardContent>
        {step === 'code' ? (
          <form onSubmit={handleCodeVerify} className="space-y-4">
            <div className="neo-card bg-[#4ECDC4]/10 border-[#4ECDC4] p-4 rounded-lg">
              <p className="text-sm font-semibold text-[#1A1A2E]">
                💡 박달초등학교 교직원만 가입할 수 있습니다.
                <br />특별코드는 관리자에게 문의하세요.
              </p>
            </div>
            
            <Input
              type="text"
              label="특별코드"
              placeholder="8자리 코드 입력"
              value={specialCode}
              onChange={(e) => setSpecialCode(e.target.value)}
              maxLength={8}
              required
            />

            {error && (
              <div className="neo-card bg-[#FF6B6B]/10 border-[#FF6B6B] p-3 rounded-lg">
                <p className="text-[#FF6B6B] font-semibold text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '확인 중...' : '코드 확인'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="neo-badge bg-[#7BED9F] px-3 py-1 rounded-full inline-block">
              ✓ 코드 확인 완료
            </div>

            <Input
              type="text"
              label="이름"
              placeholder="홍길동"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
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
              placeholder="6자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="비밀번호 확인"
              placeholder="비밀번호 재입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && (
              <div className="neo-card bg-[#FF6B6B]/10 border-[#FF6B6B] p-3 rounded-lg">
                <p className="text-[#FF6B6B] font-semibold text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </form>
        )}

        <div className="text-center pt-4 mt-4 border-t-2 border-dashed border-gray-200">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-bold text-[#4ECDC4] hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
