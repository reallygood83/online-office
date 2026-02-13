'use client';

import Image from 'next/image';
import { Card } from '@/components/ui';

export default function CurriculumVisionPage() {
  const currentYear = 2026;

  return (
    <div className="space-y-6">
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
    </div>
  );
}
