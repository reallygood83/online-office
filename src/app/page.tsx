'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Home() {
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
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏫</div>
          <p className="font-bold text-xl">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFEFE] flex flex-col">
      <header className="border-b-4 border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black">🏫 박달초 교무실</h1>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-6 py-2 font-bold border-3 border-black rounded-lg hover:bg-gray-100 transition-all"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 font-bold border-3 border-black rounded-lg bg-[#FFE500] hover:shadow-[4px_4px_0px_#000] transition-all"
            >
              회원가입
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl text-center">
          <div className="text-8xl mb-8">🏫</div>
          <h2 className="text-5xl font-black mb-6 leading-tight">
            박달초등학교<br />
            <span className="text-[#FFE500]" style={{ textShadow: '3px 3px 0 #000' }}>
              교무실 시스템
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            시간표 관리, 특별실 예약, 학사일정 등<br />
            교무 업무를 한 곳에서 편리하게 관리하세요.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link
              href="/login"
              className="px-8 py-4 text-xl font-black border-4 border-black rounded-xl bg-[#FFE500] shadow-[6px_6px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              시작하기 →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 border-4 border-black rounded-xl bg-white shadow-[4px_4px_0px_#000]">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-xl font-black mb-2">시간표 관리</h3>
              <p className="text-gray-600">전담교사 시간표를 손쉽게 편집하고 학급별 시간표를 자동으로 연동합니다.</p>
            </div>
            <div className="p-6 border-4 border-black rounded-xl bg-white shadow-[4px_4px_0px_#000]">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-xl font-black mb-2">특별실 예약</h3>
              <p className="text-gray-600">음악실, 컴퓨터실 등 특별실을 간편하게 예약하고 관리합니다.</p>
            </div>
            <div className="p-6 border-4 border-black rounded-xl bg-white shadow-[4px_4px_0px_#000]">
              <div className="text-4xl mb-3">📢</div>
              <h3 className="text-xl font-black mb-2">공지사항</h3>
              <p className="text-gray-600">중요한 학교 소식과 공지사항을 실시간으로 확인합니다.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t-4 border-black bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p className="font-bold">© 2026 박달초등학교 교무실</p>
        </div>
      </footer>
    </div>
  );
}
