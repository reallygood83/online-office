'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  user: { uid: string; displayName: string; isAdmin: boolean };
  navItems: { href: string; label: string }[];
  curriculumItems: { href: string; label: string }[];
  onLogout: () => void;
}

export function MobileMenu({ user, navItems, curriculumItems, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg border-3 border-[#1A1A2E] bg-white shadow-[4px_4px_0px_0px_#1A1A2E] active:shadow-[2px_2px_0px_0px_#1A1A2E] active:translate-x-[2px] active:translate-y-[2px] transition-all"
        aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          fixed top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-[#FFE135] 
          border-l-4 border-[#1A1A2E] shadow-[-8px_0px_0px_0px_#1A1A2E]
          z-50 overflow-y-auto transform transition-transform duration-300 ease-out
          md:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b-3 border-[#1A1A2E] bg-white">
          <div>
            <span className="text-lg font-black">📱 메뉴</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg border-2 border-[#1A1A2E] bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            aria-label="메뉴 닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b-3 border-[#1A1A2E] bg-white/80">
          <div className="text-sm text-gray-600 font-semibold">로그인 계정</div>
          <div className="font-black text-lg text-[#1A1A2E]">{user.displayName}</div>
        </div>

        <nav className="p-4 space-y-3">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className={`
              block px-4 py-3 rounded-xl font-bold border-3 border-[#1A1A2E] 
              transition-all active:translate-x-[2px] active:translate-y-[2px]
              ${isActive('/dashboard') && !pathname.startsWith('/curriculum')
                ? 'bg-[#1A1A2E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                : 'bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_#1A1A2E]'
              }
            `}
          >
            🏠 대시보드
          </Link>

          <div>
            <button
              onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
              className={`
                w-full text-left px-4 py-3 rounded-xl font-bold border-3 border-[#1A1A2E]
                transition-all flex items-center justify-between
                ${pathname.startsWith('/curriculum')
                  ? 'bg-[#1A1A2E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                  : 'bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_#1A1A2E]'
                }
              `}
            >
              <span>📚 교육과정</span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isCurriculumOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${isCurriculumOpen ? 'max-h-[500px] mt-2' : 'max-h-0'}`}>
              <div className="ml-3 space-y-2 border-l-4 border-[#1A1A2E] pl-3">
                {curriculumItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      block px-3 py-2.5 rounded-lg text-sm font-bold
                      transition-all border-2 border-[#1A1A2E]
                      ${pathname === item.href
                        ? 'bg-[#1A1A2E] text-white'
                        : 'bg-white hover:bg-[#FFE135]'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {navItems.slice(1).map((item) => {
            const icons: Record<string, string> = {
              '/schedule/teacher': '👨‍🏫',
              '/schedule/class': '📅',
              '/teachers': '👩‍🏫',
              '/classes': '🏫',
              '/reservation': '🚪',
              '/calendar': '📆',
              '/notifications': '🔔',
              '/board': '📋',
            };
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  block px-4 py-3 rounded-xl font-bold border-3 border-[#1A1A2E]
                  transition-all active:translate-x-[2px] active:translate-y-[2px]
                  ${isActive(item.href)
                    ? 'bg-[#1A1A2E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                    : 'bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_#1A1A2E]'
                  }
                `}
              >
                {icons[item.href] || '📌'} {item.label}
              </Link>
            );
          })}

          {user.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className={`
                block px-4 py-3 rounded-xl font-bold border-3 border-[#1A1A2E]
                transition-all active:translate-x-[2px] active:translate-y-[2px]
                ${isActive('/admin')
                  ? 'bg-[#FF6B6B] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                  : 'bg-[#FF6B6B]/20 hover:bg-[#FF6B6B]/30 text-[#FF6B6B] shadow-[4px_4px_0px_0px_#1A1A2E]'
                }
              `}
            >
              ⚙️ 관리자
            </Link>
          )}
        </nav>

        <div className="p-4 border-t-3 border-[#1A1A2E] bg-white/50">
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 rounded-xl font-bold border-3 border-[#1A1A2E] bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_#1A1A2E] active:shadow-[2px_2px_0px_0px_#1A1A2E] active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            🚪 로그아웃
          </button>
        </div>
      </div>
    </>
  );
}
