'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF59F]">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🏫</div>
          <div className="inline-block bg-white border-4 border-black px-6 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <p className="font-black text-xl">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF59F] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#A6FAFF] border-4 border-black rotate-12 opacity-60" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-[#FFA6F6] border-4 border-black -rotate-12 opacity-60" />
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-[#B8FF9F] border-4 border-black rotate-45 opacity-60" />
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-[#FFC29F] border-4 border-black -rotate-6 opacity-60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏫</span>
            <span className="font-black text-xl hidden sm:block">박달초</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <button className="px-4 py-2 bg-white border-4 border-black font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                로그인
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-4 py-2 bg-[#A6FAFF] border-4 border-black font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                회원가입
              </button>
            </Link>
          </div>
        </nav>

        <header className={`text-center mb-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block bg-white border-4 border-black px-10 py-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] mb-8 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-300">
            <span className="text-8xl block mb-4">🏫</span>
            <h1 className="text-5xl md:text-6xl font-black text-black tracking-tight">
              박달초등학교
            </h1>
            <div className="mt-4 inline-block bg-[#A8A6FF] border-4 border-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <p className="text-xl font-black">교직원 포털</p>
            </div>
          </div>
          <p className="text-xl font-bold text-black/70 max-w-lg mx-auto">
            전담교사 시간표 관리 및 교무 업무 지원 시스템
          </p>
        </header>

        <div className={`grid md:grid-cols-3 gap-6 mb-16 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-[#A6FAFF] border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 cursor-pointer group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📅</div>
            <h3 className="text-2xl font-black mb-2">시간표 관리</h3>
            <p className="font-semibold text-black/70">전담교사별, 학급별 시간표를 한눈에 확인하고 관리하세요</p>
            <div className="mt-4 inline-block bg-white border-2 border-black px-3 py-1 font-bold text-sm">
              8명 전담교사 →
            </div>
          </div>
          
          <div className="bg-[#FFA6F6] border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 cursor-pointer group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">👥</div>
            <h3 className="text-2xl font-black mb-2">담임 정보</h3>
            <p className="font-semibold text-black/70">학급별 담임교사 정보를 쉽게 조회하고 관리하세요</p>
            <div className="mt-4 inline-block bg-white border-2 border-black px-3 py-1 font-bold text-sm">
              32개 학급 →
            </div>
          </div>
          
          <div className="bg-[#B8FF9F] border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 cursor-pointer group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🔒</div>
            <h3 className="text-2xl font-black mb-2">안전한 접근</h3>
            <p className="font-semibold text-black/70">특별코드 인증으로 교직원만 안전하게 이용 가능</p>
            <div className="mt-4 inline-block bg-white border-2 border-black px-3 py-1 font-bold text-sm">
              보안 인증 →
            </div>
          </div>
        </div>

        <div className={`flex flex-col sm:flex-row justify-center gap-4 mb-16 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link href="/login">
            <button className="w-full sm:w-auto px-8 py-4 bg-[#A8A6FF] border-4 border-black font-black text-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              🚀 로그인하기
            </button>
          </Link>
          <Link href="/signup">
            <button className="w-full sm:w-auto px-8 py-4 bg-[#FFC29F] border-4 border-black font-black text-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              ✨ 회원가입
            </button>
          </Link>
        </div>

        <footer className="text-center py-8 border-t-4 border-black">
          <div className="inline-block bg-white border-4 border-black px-6 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <p className="font-bold">© 2026 박달초등학교 교직원 포털</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
