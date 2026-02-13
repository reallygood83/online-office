'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui';
import { NotificationBell } from './NotificationBell';
import { MobileMenu } from './MobileMenu';

interface HeaderProps {
  user?: {
    uid: string;
    displayName: string;
    isAdmin: boolean;
  } | null;
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const pathname = usePathname();
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCurriculumOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/schedule/teacher', label: '전담교사 시간표' },
    { href: '/schedule/class', label: '학급별 시간표' },
    { href: '/teachers', label: '전담교사 관리' },
    { href: '/classes', label: '학급 관리' },
    { href: '/reservation', label: '특별실 예약' },
    { href: '/calendar', label: '학사일정' },
  ];

  const curriculumItems = [
    { href: '/curriculum/vision', label: '2026 교육과정비전' },
    { href: '/curriculum/calendar', label: '연간학사일정' },
    { href: '/curriculum/guidelines', label: '교육과정 편성 유의점' },
    { href: '/curriculum/cross-subject', label: '범교과 시수편성' },
    { href: '/curriculum/activities', label: '교육활동 반영계획' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="neo-card rounded-none border-x-0 border-t-0 bg-[#FFE135]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="text-3xl">🏫</span>
            <div>
              <h1 className="text-xl font-extrabold text-[#1A1A2E]">박달초등학교</h1>
              <p className="text-sm font-semibold text-[#1A1A2E]/70">교직원 포털</p>
            </div>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className={`
                    px-3 py-2 rounded-lg font-bold text-sm transition-all
                    ${isActive('/dashboard') && !pathname.startsWith('/curriculum')
                      ? 'bg-[#1A1A2E] text-white'
                      : 'hover:bg-[#1A1A2E]/10'
                    }
                  `}
                >
                  대시보드
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
                    className={`
                      px-3 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-1
                      ${pathname.startsWith('/curriculum')
                        ? 'bg-[#1A1A2E] text-white'
                        : 'hover:bg-[#1A1A2E]/10'
                      }
                    `}
                  >
                    교육과정
                    <svg
                      className={`w-4 h-4 transition-transform ${isCurriculumOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isCurriculumOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border-3 border-[#1A1A2E] rounded-xl shadow-[4px_4px_0px_0px_#1A1A2E] z-50 overflow-hidden">
                      {curriculumItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsCurriculumOpen(false)}
                          className={`
                            block px-4 py-3 font-semibold text-sm transition-all border-b border-[#1A1A2E]/10 last:border-b-0
                            ${pathname === item.href
                              ? 'bg-[#1A1A2E] text-white'
                              : 'hover:bg-[#FFE135] text-[#1A1A2E]'
                            }
                          `}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {navItems.slice(1).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-3 py-2 rounded-lg font-bold text-sm transition-all
                      ${isActive(item.href)
                        ? 'bg-[#1A1A2E] text-white'
                        : 'hover:bg-[#1A1A2E]/10'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className={`
                      px-3 py-2 rounded-lg font-bold text-sm transition-all
                      ${isActive('/admin')
                        ? 'bg-[#FF6B6B] text-white'
                        : 'bg-[#FF6B6B]/20 hover:bg-[#FF6B6B]/30 text-[#FF6B6B]'
                      }
                    `}
                  >
                    관리자
                  </Link>
                )}
              </nav>

              <div className="hidden md:flex items-center gap-3">
                <NotificationBell userId={user.uid} />
                <div className="neo-badge px-3 py-1 rounded-full bg-white">
                  {user.displayName}
                </div>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  로그아웃
                </Button>
              </div>

              {/* Mobile Menu */}
              <div className="flex items-center gap-3 md:hidden">
                <NotificationBell userId={user.uid} />
                <MobileMenu
                  user={user}
                  navItems={navItems}
                  curriculumItems={curriculumItems}
                  onLogout={onLogout || (() => {})}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
