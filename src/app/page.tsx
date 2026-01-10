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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <div className="text-center">
          <div className="relative">
            <div className="text-9xl animate-bounce">🏫</div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FFE135] border-4 border-black rounded-full animate-ping" />
          </div>
          <div className="mt-8 inline-block bg-white border-4 border-black px-8 py-4 shadow-[6px_6px_0px_#000]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#FF6B6B] rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-[#FFE135] rounded-full animate-pulse delay-100" />
              <div className="w-3 h-3 bg-[#4ECDC4] rounded-full animate-pulse delay-200" />
              <p className="font-black text-xl ml-2">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-hidden relative">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 225, 53, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 225, 53, 0.6); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 5s ease-in-out infinite; }
        .animate-float-slow { animation: float 8s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite; 
        }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float absolute top-[10%] left-[5%] w-24 h-24 md:w-32 md:h-32 bg-[#FF6B6B] border-4 border-black rotate-12 shadow-[6px_6px_0px_#000]" />
        <div className="animate-float-reverse absolute top-[15%] right-[10%] w-20 h-20 md:w-28 md:h-28 bg-[#4ECDC4] border-4 border-black -rotate-12 shadow-[6px_6px_0px_#000]" />
        <div className="animate-float-slow absolute top-[40%] left-[8%] w-16 h-16 md:w-24 md:h-24 bg-[#FFE135] border-4 border-black rotate-45 shadow-[6px_6px_0px_#000]" />
        <div className="animate-float absolute bottom-[25%] right-[5%] w-20 h-20 md:w-32 md:h-32 bg-[#A8A6FF] border-4 border-black -rotate-6 shadow-[6px_6px_0px_#000]" />
        <div className="animate-float-reverse absolute bottom-[10%] left-[15%] w-14 h-14 md:w-20 md:h-20 bg-[#FF9FF3] border-4 border-black rotate-12 shadow-[6px_6px_0px_#000]" />
        <div className="animate-float-slow absolute top-[60%] right-[15%] w-12 h-12 md:w-16 md:h-16 bg-[#7BED9F] border-4 border-black -rotate-45 shadow-[6px_6px_0px_#000]" />
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6B6B] via-[#FFE135] to-[#4ECDC4]" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#4ECDC4] via-[#A8A6FF] to-[#FF6B6B]" />
      </div>

      <div className="relative z-10">
        <nav className={`max-w-7xl mx-auto px-4 md:px-8 py-6 flex justify-between items-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-[#FFE135] border-4 border-black p-2 shadow-[4px_4px_0px_#000]">
              <span className="text-3xl">🏫</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-black text-white text-xl">박달초등학교</p>
              <p className="text-xs text-gray-400 font-bold">교직원 포털</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <button className="px-5 py-2.5 bg-white border-4 border-black font-black shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150">
                로그인
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-5 py-2.5 bg-[#FFE135] border-4 border-black font-black shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150">
                회원가입
              </button>
            </Link>
          </div>
        </nav>

        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-20 pb-16">
          <div className={`text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="inline-block mb-6">
              <span className="bg-[#FF6B6B] text-white border-4 border-black px-4 py-2 font-black text-sm shadow-[4px_4px_0px_#000] inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                2026학년도 신규 오픈
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
              <span className="inline-block hover:scale-105 transition-transform cursor-default">교무</span>
              <span className="inline-block hover:scale-105 transition-transform cursor-default">업무의</span>
              <br />
              <span className="inline-block bg-gradient-to-r from-[#FFE135] via-[#FF6B6B] to-[#A8A6FF] bg-clip-text text-transparent animate-gradient hover:scale-105 transition-transform cursor-default">
                새로운 기준
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-medium">
              전담교사 시간표 관리부터 특별실 예약, 학사일정까지<br className="hidden md:block" />
              <span className="text-white font-bold">박달초등학교</span> 교직원을 위한 올인원 포털
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link href="/login">
                <button className="group w-full sm:w-auto px-10 py-5 bg-[#FFE135] border-4 border-black font-black text-xl shadow-[6px_6px_0px_#000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150 animate-pulse-glow">
                  <span className="flex items-center justify-center gap-3">
                    시작하기
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </button>
              </Link>
              <Link href="/signup">
                <button className="w-full sm:w-auto px-10 py-5 bg-white border-4 border-black font-black text-xl shadow-[6px_6px_0px_#000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150">
                  회원가입 ✨
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <span className="w-2 h-2 bg-[#4ECDC4] rounded-full" />
                <span className="font-bold">32개 학급</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="w-2 h-2 bg-[#FF6B6B] rounded-full" />
                <span className="font-bold">8명 전담교사</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="w-2 h-2 bg-[#FFE135] rounded-full" />
                <span className="font-bold">실시간 예약</span>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-[#FFE135] border-y-4 border-black py-4 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 px-8 shrink-0">
                <span className="font-black text-lg">📅 시간표 관리</span>
                <span className="text-2xl">★</span>
                <span className="font-black text-lg">👥 담임 정보</span>
                <span className="text-2xl">★</span>
                <span className="font-black text-lg">🏢 특별실 예약</span>
                <span className="text-2xl">★</span>
                <span className="font-black text-lg">📆 학사일정</span>
                <span className="text-2xl">★</span>
                <span className="font-black text-lg">🔒 보안 인증</span>
                <span className="text-2xl">★</span>
              </div>
            ))}
          </div>
        </div>

        <section className={`max-w-7xl mx-auto px-4 md:px-8 py-20 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              주요 <span className="text-[#FFE135]">기능</span>
            </h2>
            <p className="text-gray-400 font-medium">교직원 업무를 더 쉽고 빠르게</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group bg-[#FF6B6B] border-4 border-black p-6 shadow-[8px_8px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              <div className="text-6xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">📅</div>
              <h3 className="text-2xl font-black mb-2">시간표 관리</h3>
              <p className="font-semibold text-black/70 mb-4">전담교사별, 학급별 시간표를 한눈에 확인하고 관리하세요</p>
              <div className="inline-block bg-white border-3 border-black px-3 py-1.5 font-black text-sm">
                8명 전담교사 →
              </div>
            </div>

            <div className="group bg-[#4ECDC4] border-4 border-black p-6 shadow-[8px_8px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              <div className="text-6xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">👥</div>
              <h3 className="text-2xl font-black mb-2">담임 정보</h3>
              <p className="font-semibold text-black/70 mb-4">학급별 담임교사 정보를 쉽게 조회하고 관리하세요</p>
              <div className="inline-block bg-white border-3 border-black px-3 py-1.5 font-black text-sm">
                32개 학급 →
              </div>
            </div>

            <div className="group bg-[#A8A6FF] border-4 border-black p-6 shadow-[8px_8px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              <div className="relative">
                <div className="text-6xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🏢</div>
                <span className="absolute -top-2 -right-2 bg-[#FF6B6B] text-white text-xs font-black px-2 py-1 border-2 border-black">NEW</span>
              </div>
              <h3 className="text-2xl font-black mb-2">특별실 예약</h3>
              <p className="font-semibold text-black/70 mb-4">과학실, 컴퓨터실 등 특별실을 간편하게 예약하세요</p>
              <div className="inline-block bg-white border-3 border-black px-3 py-1.5 font-black text-sm">
                실시간 예약 →
              </div>
            </div>

            <div className="group bg-[#FFE135] border-4 border-black p-6 shadow-[8px_8px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              <div className="relative">
                <div className="text-6xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">📆</div>
                <span className="absolute -top-2 -right-2 bg-[#FF6B6B] text-white text-xs font-black px-2 py-1 border-2 border-black">NEW</span>
              </div>
              <h3 className="text-2xl font-black mb-2">학사일정</h3>
              <p className="font-semibold text-black/70 mb-4">학교 행사와 일정을 캘린더에서 한눈에 확인하세요</p>
              <div className="inline-block bg-white border-3 border-black px-3 py-1.5 font-black text-sm">
                일정 확인 →
              </div>
            </div>

            <div className="group bg-[#FF9FF3] border-4 border-black p-6 shadow-[8px_8px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              <div className="text-6xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🔒</div>
              <h3 className="text-2xl font-black mb-2">보안 인증</h3>
              <p className="font-semibold text-black/70 mb-4">특별코드 인증으로 교직원만 안전하게 이용 가능합니다</p>
              <div className="inline-block bg-white border-3 border-black px-3 py-1.5 font-black text-sm">
                안전한 접근 →
              </div>
            </div>

            <div className="group bg-[#7BED9F] border-4 border-black p-6 shadow-[8px_8px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              <div className="text-6xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">⚡</div>
              <h3 className="text-2xl font-black mb-2">실시간 동기화</h3>
              <p className="font-semibold text-black/70 mb-4">모든 데이터가 실시간으로 동기화되어 항상 최신 상태</p>
              <div className="inline-block bg-white border-3 border-black px-3 py-1.5 font-black text-sm">
                즉시 반영 →
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border-y-4 border-black py-20">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              지금 바로 <span className="bg-[#FFE135] px-2">시작하세요</span>
            </h2>
            <p className="text-lg text-gray-600 mb-10 font-medium">
              박달초등학교 교직원이라면 누구나 이용할 수 있습니다
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <button className="w-full sm:w-auto px-12 py-5 bg-[#0a0a0a] text-white border-4 border-black font-black text-xl shadow-[6px_6px_0px_#FFE135] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150">
                  무료 회원가입
                </button>
              </Link>
              <Link href="/login">
                <button className="w-full sm:w-auto px-12 py-5 bg-white border-4 border-black font-black text-xl shadow-[6px_6px_0px_#000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150">
                  로그인하기
                </button>
              </Link>
            </div>
          </div>
        </section>

        <footer className="bg-[#0a0a0a] py-12 border-t-4 border-black">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#FFE135] border-4 border-black p-2 shadow-[4px_4px_0px_#000]">
                  <span className="text-2xl">🏫</span>
                </div>
                <div>
                  <p className="font-black text-white">박달초등학교</p>
                  <p className="text-xs text-gray-500 font-bold">교직원 포털</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-gray-500 font-bold text-sm">
                  © 2026 박달초등학교 교직원 포털
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Made with 💛 for Teachers
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
