'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: '대시보드', icon: '📊' },
    { href: '/schedule/teacher', label: '전담교사 시간표', icon: '👨‍🏫' },
    { href: '/schedule/class', label: '학급별 시간표', icon: '🏫' },
    { href: '/teachers', label: '전담교사 관리', icon: '👥' },
    { href: '/classes', label: '학급/담임 관리', icon: '📚' },
    { href: '/reservation', label: '특별실 예약', icon: '🏢' },
    { href: '/calendar', label: '학사일정', icon: '📅' },
    { href: '/board', label: '정보공유 게시판', icon: '📋' },
    { href: '/notifications', label: '전체 알림', icon: '🔔' },
  ];

  const adminItems = [
    { href: '/admin', label: '관리자 대시보드', icon: '⚙️' },
    { href: '/admin/announcements', label: '공지사항 관리', icon: '📢' },
    { href: '/admin/users', label: '사용자 관리', icon: '👤' },
    { href: '/admin/settings', label: '시스템 설정', icon: '🔧' },
    { href: '/admin/admins', label: '관리자 지정', icon: '🛡️' },
    { href: '/admin/rooms', label: '특별실 관리', icon: '🏢' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen neo-card rounded-none border-y-0 border-l-0 bg-white">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all
              ${isActive(item.href)
                ? 'bg-[#FFE135] shadow-[4px_4px_0px_#000] border-3 border-black'
                : 'hover:bg-gray-100'
              }
            `}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="border-t-3 border-black my-4" />
            <p className="px-4 py-2 text-sm font-bold text-gray-500">관리자 메뉴</p>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all
                  ${isActive(item.href)
                    ? 'bg-[#FF6B6B] text-white shadow-[4px_4px_0px_#000] border-3 border-black'
                    : 'hover:bg-[#FF6B6B]/10'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
