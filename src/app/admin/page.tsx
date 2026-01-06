'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export default function AdminDashboardPage() {
  const adminMenus = [
    {
      href: '/admin/users',
      icon: '👤',
      title: '사용자 관리',
      description: '등록된 사용자 조회 및 권한 관리',
      color: 'bg-[#FFE135]',
    },
    {
      href: '/admin/settings',
      icon: '🔧',
      title: '시스템 설정',
      description: '특별코드 변경, 학기 설정',
      color: 'bg-[#4ECDC4]',
    },
    {
      href: '/admin/admins',
      icon: '🛡️',
      title: '관리자 지정',
      description: '관리자 권한 부여 및 해제',
      color: 'bg-[#FF6B6B]',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">⚙️ 관리자 대시보드</h1>
        <p className="text-gray-600 mt-1">시스템 전체를 관리하세요</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {adminMenus.map((menu) => (
          <Link key={menu.href} href={menu.href}>
            <Card className={`${menu.color} hover:translate-y-[-4px] transition-all cursor-pointer h-full`}>
              <CardHeader>
                <div className="text-4xl mb-2">{menu.icon}</div>
                <CardTitle>{menu.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="opacity-80">{menu.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 시스템 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">현재 학기</span>
                <span className="neo-badge bg-[#FFE135] px-3 py-1 rounded-full font-bold">
                  2026학년도 1학기
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">총 학급 수</span>
                <span className="font-bold">32학급</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">전담교사</span>
                <span className="font-bold">8명</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">주간 전담시수</span>
                <span className="font-bold">156시간</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔔 관리자 알림</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-[#7BED9F]/20 rounded-lg border-l-4 border-[#7BED9F]">
                <p className="font-bold text-sm">시스템 정상 작동 중</p>
                <p className="text-xs text-gray-600 mt-1">모든 서비스가 정상입니다.</p>
              </div>
              <div className="p-3 bg-[#FFE135]/20 rounded-lg border-l-4 border-[#FFE135]">
                <p className="font-bold text-sm">담임교사 정보 미설정</p>
                <p className="text-xs text-gray-600 mt-1">학급별 담임교사 정보를 입력해주세요.</p>
              </div>
              <div className="p-3 bg-[#4ECDC4]/20 rounded-lg border-l-4 border-[#4ECDC4]">
                <p className="font-bold text-sm">전담교사 실명 미설정</p>
                <p className="text-xs text-gray-600 mt-1">전담교사 실제 이름을 입력해주세요.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
