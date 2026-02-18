'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useAuth } from '@/lib/hooks/useAuth';
import { getTeachers, getClasses } from '@/lib/firebase/firestore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClasses: 32,
    totalTeachers: 0,
    totalHours: 0,
    semester: '1학기',
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [teachers, classes] = await Promise.all([
          getTeachers(),
          getClasses(),
        ]);

        console.log('Teachers from Firebase:', teachers);
        console.log('Classes from Firebase:', classes);
        console.log('Classes length:', classes?.length);
        console.log('Classes is array:', Array.isArray(classes));

        // Calculate total hours from teacher info
        let totalHours = 0;
        teachers.forEach((teacher) => {
          console.log(`Teacher ${teacher.id}: weeklyHours = ${teacher.weeklyHours}`);
          totalHours += teacher.weeklyHours || 0;
        });

        console.log(`Total: ${teachers.length} teachers, ${totalHours} hours, ${classes.length} classes`);

        setStats({
          totalClasses: classes.length || 32,
          totalTeachers: teachers.length || 9,
          totalHours: totalHours || 172,
          semester: '1학기',
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Fallback to default values
        setStats({
          totalClasses: 32,
          totalTeachers: 9,
          totalHours: 172,
          semester: '1학기',
        });
      }
    };

    loadDashboardData();
  }, []);

  const quickLinks = [
    {
      href: '/schedule/teacher',
      icon: '👨‍🏫',
      title: '전담교사 시간표',
      description: '전담교사별 주간 시간표 확인',
      color: 'bg-[#FFE135]',
    },
    {
      href: '/schedule/class',
      icon: '🏫',
      title: '학급별 시간표',
      description: '1~6학년 학급별 전담 시간표',
      color: 'bg-[#4ECDC4]',
    },
    {
      href: '/reservation',
      icon: '🏢',
      title: '특별실 예약',
      description: '과학실, 컴퓨터실 등 예약',
      color: 'bg-[#74B9FF]',
    },
    {
      href: '/calendar',
      icon: '📅',
      title: '학사일정',
      description: '학교 행사 및 일정 확인',
      color: 'bg-[#FD79A8]',
    },
    {
      href: '/teachers',
      icon: '👥',
      title: '전담교사 관리',
      description: '전담교사 정보 조회 및 수정',
      color: 'bg-[#FF9FF3]',
    },
    {
      href: '/classes',
      icon: '📚',
      title: '학급/담임 관리',
      description: '학급별 담임교사 정보 관리',
      color: 'bg-[#7BED9F]',
    },
    {
      href: '/board',
      icon: '📋',
      title: '정보공유 게시판',
      description: '교무부/연구부/정보부 소식을 공유',
      color: 'bg-[#FFEAA7]',
    },
    {
      href: '/notifications',
      icon: '🔔',
      title: '전체 알림',
      description: '받은 알림을 한 번에 확인',
      color: 'bg-[#DFE6E9]',
    },
  ];

  const statsDisplay = [
    { label: '총 학급 수', value: stats.totalClasses.toString(), icon: '🏫' },
    { label: '전담교사', value: stats.totalTeachers.toString(), icon: '👨‍🏫' },
    { label: '주간 전담시수', value: stats.totalHours.toString(), icon: '📅' },
    { label: '학기', value: stats.semester, icon: '📆' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">안녕하세요, {user?.displayName}님! 👋</h1>
          <p className="text-gray-600 mt-2">박달초등학교 교직원 포털에 오신 것을 환영합니다.</p>
        </div>
        {user?.isAdmin && (
          <Link href="/admin">
            <Button variant="secondary">
              ⚙️ 관리자 페이지
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsDisplay.map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-extrabold">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-extrabold mb-4">빠른 메뉴</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className={`${link.color} hover:translate-y-[-4px] transition-all cursor-pointer h-full`}>
                <div className="text-4xl mb-3">{link.icon}</div>
                <h3 className="text-lg font-extrabold mb-1">{link.title}</h3>
                <p className="text-sm opacity-80">{link.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📢 공지사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="font-bold">2026학년도 1학기 시간표 확정</p>
                <p className="text-sm text-gray-600 mt-1">전담교사별, 학급별 시간표가 확정되었습니다.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="font-bold">시스템 업데이트 안내</p>
                <p className="text-sm text-gray-600 mt-1">교직원 포털 시스템이 새롭게 오픈되었습니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 오늘의 시간표 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-[#FFE135]/20 rounded-lg">
                <span className="font-bold">영어</span>
                <span className="neo-badge bg-[#FFE135] px-2 py-1 rounded">12시간</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#7BED9F]/20 rounded-lg">
                <span className="font-bold">체육</span>
                <span className="neo-badge bg-[#7BED9F] px-2 py-1 rounded">13시간</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#FF9FF3]/20 rounded-lg">
                <span className="font-bold">음악</span>
                <span className="neo-badge bg-[#FF9FF3] px-2 py-1 rounded">4시간</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#A29BFE]/20 rounded-lg">
                <span className="font-bold">도덕</span>
                <span className="neo-badge bg-[#A29BFE] px-2 py-1 rounded">3시간</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
