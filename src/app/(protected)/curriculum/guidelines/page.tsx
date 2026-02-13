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

type TabType = 'guidelines' | 'workshop';

const TABS: { id: TabType; label: string; icon: string; description: string; fileUrl: string }[] = [
  {
    id: 'guidelines',
    label: '교육과정 편성 안내',
    icon: '📋',
    description: '2026 안양과천 초등 교육과정 편성 안내 자료',
    fileUrl: '/documents/curriculum-guidelines-2026.pdf',
  },
  {
    id: 'workshop',
    label: '담당자 워크숍',
    icon: '👩‍🏫',
    description: '2026 학교교육과정 담당자 워크숍 안내자료',
    fileUrl: '/documents/curriculum-workshop-2026.pdf',
  },
];

export default function CurriculumGuidelinesPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('guidelines');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-black text-[#1A1A2E]">
          📋 교육과정 편성 유의점
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          교육과정 편성 관련 안내 자료 모음
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
        <div className="flex border-b-3 border-[#1A1A2E]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-6 py-4 font-bold text-lg transition-all flex items-center justify-center gap-2
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-[#1A1A2E]'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>📄</span>
            {currentTab.description}
          </h2>
        </div>
        
        <div className="bg-[#525659]">
          {isClient && (
            <PDFViewer key={activeTab} fileUrl={currentTab.fileUrl} />
          )}
        </div>
      </Card>
    </div>
  );
}
