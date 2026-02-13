'use client';

import Image from 'next/image';
import { Card } from '@/components/ui';

export default function CurriculumVisionPage() {
  const currentYear = 2026;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-[#1A1A2E]">
          🎯 {currentYear} 교육과정 비전
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          박달초등학교 교육과정 운영 계획
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
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
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#E3F2FD]">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span> 교육 목표
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {['자주인', '창의인', '교양인', '공동체인'].map((goal, idx) => (
              <div
                key={goal}
                className="bg-white p-3 rounded-xl border-2 border-[#1A1A2E] text-center font-bold"
              >
                {idx + 1}. {goal}
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#FFF3E0]">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">💎</span> 핵심 가치
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              '꿈·끼·자율성',
              '배움·탐구·도전',
              '문화·예술·인성',
              '건강·배려·나눔',
            ].map((value, idx) => (
              <div
                key={value}
                className="bg-white p-3 rounded-xl border-2 border-[#1A1A2E] text-center font-bold text-sm"
              >
                {idx + 1}. {value}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="bg-[#E8F5E9]">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">📚</span> 학생 중심 역량
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: '🧠', name: '자기관리' },
            { icon: '💡', name: '지식정보처리' },
            { icon: '🎨', name: '창의적 사고' },
            { icon: '🤝', name: '협력적 소통' },
            { icon: '❤️', name: '심미적 감성' },
            { icon: '🌍', name: '공동체 역량' },
          ].map((item) => (
            <div
              key={item.name}
              className="bg-white p-4 rounded-xl border-2 border-[#1A1A2E] text-center"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-bold text-sm">{item.name}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-[#FCE4EC]">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span> 핵심 교육 과제
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border-2 border-[#1A1A2E]">
            <div className="font-bold text-lg mb-2">📖 과제 1</div>
            <p>배움, 나눔, 공감 독서로 생각이 쑥쑥!!</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-[#1A1A2E]">
            <div className="font-bold text-lg mb-2">🎭 과제 2</div>
            <p>꿈·끼·감성 찾아 문화예술 속으로!!</p>
          </div>
        </div>
      </Card>

      <Card className="bg-[#F3E5F5]">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">👥</span> 교육공동체상
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { role: '학생상', desc: '꿈과 끼를 펼치며 배움을 즐기는 어린이' },
            { role: '교사상', desc: '수업 전문성을 갖추고 학생을 존중하는 교사' },
            { role: '학부모상', desc: '신뢰를 바탕으로 버팀목이 되어 주는 학부모' },
            { role: '지역사회', desc: '협력과 상생으로 학교를 지원하는 교육공동체' },
          ].map((item) => (
            <div
              key={item.role}
              className="bg-white p-4 rounded-xl border-2 border-[#1A1A2E]"
            >
              <div className="font-bold text-[#764ba2] mb-2">{item.role}</div>
              <p className="text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
