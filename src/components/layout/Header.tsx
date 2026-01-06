'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui';

interface HeaderProps {
  user?: {
    displayName: string;
    isAdmin: boolean;
  } | null;
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/schedule/teacher', label: '전담교사 시간표' },
    { href: '/schedule/class', label: '학급별 시간표' },
    { href: '/teachers', label: '전담교사 관리' },
    { href: '/classes', label: '학급 관리' },
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
                {navItems.map((item) => (
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

              <div className="flex items-center gap-3">
                <div className="neo-badge px-3 py-1 rounded-full bg-white">
                  {user.displayName}
                </div>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  로그아웃
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
