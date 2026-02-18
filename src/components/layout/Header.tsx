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
  const [openMenu, setOpenMenu] = useState<'curriculum' | 'schedule' | 'management' | 'more' | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
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
    { href: '/notifications', label: '알림' },
    { href: '/board', label: '게시판' },
  ];

  const curriculumItems = [
    { href: '/curriculum/vision', label: '2026 교육과정비전' },
    { href: '/curriculum/calendar', label: '연간학사일정' },
    { href: '/curriculum/guidelines', label: '교육과정 편성 유의점' },
    { href: '/curriculum/cross-subject', label: '범교과 시수편성' },
    { href: '/curriculum/activities', label: '교육활동 반영계획' },
  ];

  const scheduleItems = [
    { href: '/schedule/teacher', label: '전담교사 시간표' },
    { href: '/schedule/class', label: '학급별 시간표' },
  ];

  const managementItems = [
    { href: '/teachers', label: '전담교사 관리' },
    { href: '/classes', label: '학급 관리' },
  ];

  const moreItems = [
    { href: '/reservation', label: '특별실 예약', icon: '🚪' },
    { href: '/calendar', label: '학사일정', icon: '📆' },
    { href: '/notifications', label: '알림', icon: '🔔' },
    { href: '/board', label: '게시판', icon: '📋' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  const renderDropdown = (
    key: 'curriculum' | 'schedule' | 'management' | 'more',
    label: string,
    items: Array<{ href: string; label: string; icon?: string }>,
    active: boolean,
    widthClass = 'w-56'
  ) => {
    const isOpen = openMenu === key;

    return (
      <div className="relative">
        <button
          onClick={() => setOpenMenu(isOpen ? null : key)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className={`
            px-3 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-1
            ${active || isOpen ? 'bg-[#1A1A2E] text-white' : 'hover:bg-[#1A1A2E]/10'}
          `}
        >
          {label}
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className={`absolute top-full left-0 mt-2 ${widthClass} bg-white border-3 border-[#1A1A2E] rounded-xl shadow-[4px_4px_0px_0px_#1A1A2E] z-50 overflow-hidden`}>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpenMenu(null)}
                className={`
                  block px-4 py-3 font-semibold text-sm transition-all border-b border-[#1A1A2E]/10 last:border-b-0
                  ${pathname === item.href ? 'bg-[#1A1A2E] text-white' : 'hover:bg-[#FFE135] text-[#1A1A2E]'}
                `}
              >
                {item.icon ? `${item.icon} ${item.label}` : item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

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
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2" ref={navRef}>
                <Link
                  href="/dashboard"
                  className={`
                    px-3 py-2 rounded-lg font-bold text-sm transition-all
                    ${isActive('/dashboard')
                      && !pathname.startsWith('/curriculum')
                      && !pathname.startsWith('/schedule')
                      && !pathname.startsWith('/teachers')
                      && !pathname.startsWith('/classes')
                      && !pathname.startsWith('/reservation')
                      && !pathname.startsWith('/calendar')
                      && !pathname.startsWith('/notifications')
                      && !pathname.startsWith('/board')
                      ? 'bg-[#1A1A2E] text-white'
                      : 'hover:bg-[#1A1A2E]/10'
                    }
                  `}
                >
                  🏠 대시보드
                </Link>

                {renderDropdown('curriculum', '📚 교육과정', curriculumItems, pathname.startsWith('/curriculum'))}
                {renderDropdown('schedule', '📅 시간표', scheduleItems, pathname.startsWith('/schedule'), 'w-44')}
                {renderDropdown(
                  'management',
                  '🛠️ 관리',
                  managementItems,
                  pathname.startsWith('/teachers') || pathname.startsWith('/classes'),
                  'w-40'
                )}
                {renderDropdown(
                  'more',
                  '더보기',
                  moreItems,
                  pathname.startsWith('/reservation')
                    || pathname.startsWith('/calendar')
                    || pathname.startsWith('/notifications')
                    || pathname.startsWith('/board'),
                  'w-40'
                )}

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
              </div>

              <div className="hidden md:flex items-center gap-3">
                <NotificationBell userId={user.uid} />
                <div className="neo-badge px-3 py-1 rounded-full bg-white">
                  {user.displayName}
                </div>
                <Button variant="ghost" size="sm" className="px-3" onClick={onLogout}>
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
