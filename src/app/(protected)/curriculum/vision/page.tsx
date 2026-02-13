'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui';

type TabType = 'vision' | 'autonomous';

export default function CurriculumVisionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('vision');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-black text-[#1A1A2E]">
          🎯 2026 교육과정 비전
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          박달초등학교 교육과정 운영 계획
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex border-b-3 border-[#1A1A2E]">
          <button
            onClick={() => setActiveTab('vision')}
            className={`flex-1 px-6 py-4 font-bold text-lg transition-all flex items-center justify-center gap-2
              ${activeTab === 'vision'
                ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-[#1A1A2E]'
              }`}
          >
            <span>🌟</span>
            <span>교육과정 비전</span>
          </button>
          <button
            onClick={() => setActiveTab('autonomous')}
            className={`flex-1 px-6 py-4 font-bold text-lg transition-all flex items-center justify-center gap-2
              ${activeTab === 'autonomous'
                ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-[#1A1A2E]'
              }`}
          >
            <span>🎭</span>
            <span>학교 자율과제</span>
          </button>
        </div>

        {activeTab === 'vision' ? <VisionTab /> : <AutonomousTab />}
      </Card>
    </div>
  );
}

function VisionTab() {
  return (
    <>
      <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4">
        <h2 className="text-2xl font-bold text-center">
          🌟 배움·감성·나눔으로 함께 하는 행복공동체
        </h2>
      </div>
      <div className="p-6 flex justify-center bg-gray-50">
        <div className="relative w-full max-w-4xl">
          <Image
            src="/images/curriculum/vision-2026.png"
            alt="2026 교육과정 비전"
            width={1200}
            height={1600}
            className="w-full h-auto rounded-xl border-3 border-[#1A1A2E] shadow-[8px_8px_0px_0px_#1A1A2E]"
            priority
          />
        </div>
      </div>
    </>
  );
}

function AutonomousTab() {
  const gradeAllocation = [
    { grade: '1학년', drama: 12, music: 5 },
    { grade: '2학년', drama: 12, music: 5 },
    { grade: '3학년', drama: 12, music: 5 },
    { grade: '4학년', drama: 12, music: 5 },
    { grade: '5학년', drama: 16, music: 0 },
    { grade: '6학년', drama: 12, music: 5 },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-[#FFF5F5] to-white">
      <div className="text-center p-4 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] rounded-xl border-3 border-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E]">
        <h2 className="text-xl font-black text-white">
          🎭 오감 만족 예술 활동을 통해 나를 발견하고 함께 성장하는
        </h2>
        <h3 className="text-2xl font-black text-[#FFE135] mt-1">
          박달 감성 꽃피우기
        </h3>
      </div>

      <div className="bg-[#FFF9C4] p-4 rounded-xl border-3 border-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📋</span>
          <span className="font-black">경기교육 정책 연계</span>
        </div>
        <p className="text-sm font-bold text-gray-700">
          2-1-2-2 학생맞춤형 학교예술·독서교육 확대
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border-3 border-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E]">
        <h3 className="text-lg font-black text-center mb-4 flex items-center justify-center gap-2">
          <span className="text-2xl">⭐</span>
          학년별 차시 배정표
          <span className="text-2xl">⭐</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border-3 border-[#1A1A2E] px-3 py-2 bg-[#1A1A2E] text-white">학년</th>
                {gradeAllocation.map((g) => (
                  <th key={g.grade} className="border-3 border-[#1A1A2E] px-3 py-2 bg-gray-100 font-black">
                    {g.grade}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-3 border-[#1A1A2E] px-3 py-3 bg-[#FFE4E1] font-black text-center">
                  🎭 연극
                </td>
                {gradeAllocation.map((g) => (
                  <td
                    key={`drama-${g.grade}`}
                    className={`border-3 border-[#1A1A2E] px-3 py-3 text-center font-black text-lg
                      ${g.drama === 16 ? 'bg-[#FF6B6B] text-white' : 'bg-[#FFE4E1]'}`}
                  >
                    {g.drama}차시
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-3 border-[#1A1A2E] px-3 py-3 bg-[#E8F5E9] font-black text-center">
                  🥁 국악
                </td>
                {gradeAllocation.map((g) => (
                  <td
                    key={`music-${g.grade}`}
                    className={`border-3 border-[#1A1A2E] px-3 py-3 text-center font-black text-lg
                      ${g.music === 0 ? 'bg-gray-300 text-gray-500' : 'bg-[#E8F5E9]'}`}
                  >
                    {g.music === 0 ? '-' : `${g.music}차시`}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          ※ 5학년은 연극 16차시 집중 배정, 국악 미배정
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#FFE4E1] p-4 rounded-xl border-3 border-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎭</span>
            <h4 className="font-black text-[#FF6B6B]">연극 프로그램</h4>
          </div>
          <p className="font-bold text-sm mb-2">마음을 잇고 나를 세우는 박달 연극 무대</p>
          <div className="text-xs space-y-1 text-gray-700">
            <p>• 대상: 1~6학년 전체</p>
            <p>• 예산: 16,320천원</p>
            <p>• 목적: 연극 활동을 통한 자아 발견 및 표현력 신장</p>
          </div>
        </div>

        <div className="bg-[#E8F5E9] p-4 rounded-xl border-3 border-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🥁</span>
            <h4 className="font-black text-[#4CAF50]">국악 프로그램</h4>
          </div>
          <p className="font-bold text-sm mb-2">우리 소리, 장단으로 깨우는 전통 감성 돋움</p>
          <div className="text-xs space-y-1 text-gray-700">
            <p>• 대상: 1~4학년, 6학년</p>
            <p>• 예산: 5,200천원</p>
            <p>• 목적: 전통 음악을 통한 문화적 감수성 함양</p>
          </div>
        </div>

        <div className="bg-[#E3F2FD] p-4 rounded-xl border-3 border-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎵</span>
            <h4 className="font-black text-[#2196F3]">합창/기악</h4>
          </div>
          <p className="font-bold text-sm mb-2">아름다운 화음으로 소통하는 &apos;꿈꾸는 하모니&apos;</p>
          <div className="text-xs space-y-1 text-gray-700">
            <p>• 대상: 4~6학년</p>
            <p>• 예산: 5,900천원</p>
            <p>• 목적: 협동적 음악 활동을 통한 소통 능력 강화</p>
          </div>
        </div>

        <div className="bg-[#F3E5F5] p-4 rounded-xl border-3 border-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌸</span>
            <h4 className="font-black text-[#9C27B0]">예술꽃 무대</h4>
          </div>
          <p className="font-bold text-sm mb-2">성장을 나누고 꿈을 펼치는 &apos;박달 예술꽃 무대&apos;</p>
          <div className="text-xs space-y-1 text-gray-700">
            <p>• 대상: 1~6학년 전체</p>
            <p>• 예산: 3,840천원 <span className="font-black text-[#9C27B0]">(학급당 12만원 지원)</span></p>
            <p>• 목적: 예술 활동 성과 공유 및 발표 기회 제공</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A2E] text-white p-4 rounded-xl border-3 border-[#1A1A2E] shadow-[4px_4px_0px_0px_#FFE135]">
        <h4 className="font-black text-center mb-3 text-[#FFE135]">💰 예산 현황</h4>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-white/10 p-3 rounded-lg">
            <p className="text-[#FFE135] font-black text-lg">31,260천원</p>
            <p className="text-xs">총 예산</p>
          </div>
          <div className="bg-white/10 p-3 rounded-lg">
            <p className="text-[#FF6B6B] font-black text-lg">68.8%</p>
            <p className="text-xs">강사비</p>
          </div>
          <div className="bg-white/10 p-3 rounded-lg">
            <p className="text-[#4ECDC4] font-black text-lg">31.2%</p>
            <p className="text-xs">운영비</p>
          </div>
        </div>
      </div>
    </div>
  );
}
