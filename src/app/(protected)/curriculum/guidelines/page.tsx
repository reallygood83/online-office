'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui';

const PDFViewer = dynamic(() => import('@/components/curriculum/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[800px] bg-gray-100 rounded-xl border-3 border-[#1A1A2E]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#1A1A2E] border-t-transparent mx-auto mb-4"></div>
        <p className="text-lg font-bold text-[#1A1A2E]">PDF 뷰어 로딩 중...</p>
      </div>
    </div>
  ),
});

export default function CurriculumGuidelinesPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-black text-[#1A1A2E]">
          📋 교육과정 편성 유의점
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          2026 안양과천 초등 교육과정 편성 안내 자료
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#E3F2FD] p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔍</span>
            <div>
              <h3 className="font-bold">검색 기능</h3>
              <p className="text-sm text-gray-600">Ctrl+F로 문서 내 검색</p>
            </div>
          </div>
        </Card>
        <Card className="bg-[#FFF3E0] p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📑</span>
            <div>
              <h3 className="font-bold">썸네일 보기</h3>
              <p className="text-sm text-gray-600">왼쪽 사이드바에서 페이지 탐색</p>
            </div>
          </div>
        </Card>
        <Card className="bg-[#E8F5E9] p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🖨️</span>
            <div>
              <h3 className="font-bold">인쇄 & 다운로드</h3>
              <p className="text-sm text-gray-600">상단 툴바에서 PDF 저장</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>📄</span>
            2026 안양과천 초등 교육과정 편성 안내 자료
          </h2>
          <p className="text-sm text-white/80 mt-1">
            교육과정 편성 시 참고해야 할 핵심 지침과 유의사항
          </p>
        </div>
        
        <div className="bg-[#525659]">
          {isClient && (
            <PDFViewer fileUrl="/documents/curriculum-guidelines-2026.pdf" />
          )}
        </div>
      </Card>

      <Card className="bg-[#FCE4EC]">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span> 주요 편성 유의점 요약
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border-2 border-[#1A1A2E]">
            <h4 className="font-bold text-[#667eea] mb-2">📚 교과 편성</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• 국어, 수학: 기준 시수 확보 필수</li>
              <li>• 체육: 주당 3시간 이상 편성</li>
              <li>• 예술(음악/미술): 균형 있게 편성</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-[#1A1A2E]">
            <h4 className="font-bold text-[#764ba2] mb-2">🎯 창의적 체험활동</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• 자율, 동아리, 봉사, 진로 영역</li>
              <li>• 학년군별 기준 시수 준수</li>
              <li>• 학교 자율 시간 활용 가능</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-[#1A1A2E]">
            <h4 className="font-bold text-[#FF6B6B] mb-2">⚠️ 범교과 학습</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• 안전교육: 학년별 51시간 이상</li>
              <li>• 환경교육, 인성교육 반영</li>
              <li>• 교과 및 창체 연계 운영</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-[#1A1A2E]">
            <h4 className="font-bold text-[#4ECDC4] mb-2">📝 수업일수</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• 연간 190일 이상 확보</li>
              <li>• 기후재난 등 감축 시 교육청 협의</li>
              <li>• 가정학습일 최대 20일</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
