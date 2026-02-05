'use client';

import Link from 'next/link';
import { SPECIAL_TEACHERS } from '@/types';

interface DashboardCard {
  title: string;
  description: string;
  href: string;
  color: string;
  icon: React.ReactNode;
  stat?: string;
}

const dashboardCards: DashboardCard[] = [
  {
    title: '시간표 편집',
    description: '전담교사 시간표를 수정하고 충돌을 확인합니다',
    href: '/admin/schedules',
    color: 'bg-neo-cyan-300',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    stat: `${SPECIAL_TEACHERS.length}명의 전담교사`,
  },
  {
    title: '전담교사 관리',
    description: '전담교사를 추가, 수정, 삭제합니다',
    href: '/admin/teachers',
    color: 'bg-neo-pink-300',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    stat: '영어, 체육, 음악, 도덕',
  },
  {
    title: '담임교사 관리',
    description: '학급별 담임교사를 배정합니다',
    href: '/admin/teachers?tab=homeroom',
    color: 'bg-neo-lime-300',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    stat: '32개 학급',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">관리자 대시보드</h1>
          <p className="text-lg text-gray-600 mt-1">박달초등학교 시간표 관리 시스템</p>
        </div>
        <div className="px-4 py-2 bg-neo-yellow-300 border-3 border-black rounded-lg shadow-neo font-bold">
          2026학년도 1학기
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`
              group block p-6 ${card.color} border-4 border-black rounded-xl shadow-neo-md
              hover:shadow-neo hover:translate-x-1 hover:translate-y-1
              transition-all duration-150
            `}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white border-3 border-black rounded-lg shadow-neo-sm">
                {card.icon}
              </div>
              <svg 
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            
            <h2 className="mt-4 text-xl font-black">{card.title}</h2>
            <p className="mt-2 text-sm font-medium text-gray-700">{card.description}</p>
            
            {card.stat && (
              <div className="mt-4 inline-block px-3 py-1 bg-white border-2 border-black rounded-full text-sm font-bold">
                {card.stat}
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-8 p-6 bg-white border-4 border-black rounded-xl shadow-neo-md">
        <h2 className="text-xl font-black mb-4">빠른 정보</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '전담교사', value: SPECIAL_TEACHERS.length, color: 'bg-neo-cyan-200' },
            { label: '총 학급', value: 32, color: 'bg-neo-pink-200' },
            { label: '주당 수업', value: 25, color: 'bg-neo-lime-200' },
            { label: '과목', value: 4, color: 'bg-neo-orange-200' },
          ].map((stat) => (
            <div 
              key={stat.label}
              className={`${stat.color} border-3 border-black rounded-lg p-4 shadow-neo-sm`}
            >
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="text-sm font-bold text-gray-700">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
