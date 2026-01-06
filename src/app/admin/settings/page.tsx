'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { initializeScheduleData, checkDataInitialized } from '@/lib/firebase/scheduleService';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function AdminSettingsPage() {
  const [specialCode, setSpecialCode] = useState('20261234');
  const [currentSemester, setCurrentSemester] = useState<1 | 2>(1);
  const [currentYear, setCurrentYear] = useState(2026);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isDataInitialized, setIsDataInitialized] = useState<boolean | null>(null);
  const [initMessage, setInitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const checkInit = async () => {
      const initialized = await checkDataInitialized();
      setIsDataInitialized(initialized);

      if (initialized) {
        try {
          const settingsRef = doc(db, 'settings', 'main');
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            if (data.specialCode) setSpecialCode(data.specialCode);
            if (data.currentSemester) setCurrentSemester(data.currentSemester);
            if (data.currentYear) setCurrentYear(data.currentYear);
          }
        } catch (error) {
          console.log('Failed to load settings from Firestore');
        }
      }
    };
    checkInit();
  }, []);

  const handleInitialize = async () => {
    if (!confirm('시간표 데이터를 Firebase에 초기화하시겠습니까?\n기존 데이터가 있다면 덮어씁니다.')) {
      return;
    }

    setIsInitializing(true);
    setInitMessage(null);

    const result = await initializeScheduleData();
    setInitMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    if (result.success) {
      setIsDataInitialized(true);
    }

    setIsInitializing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsRef = doc(db, 'settings', 'main');
      await setDoc(settingsRef, {
        specialCode,
        currentSemester,
        currentYear,
        schoolName: '박달초등학교',
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setInitMessage({ type: 'success', text: '설정이 저장되었습니다!' });
    } catch (error: any) {
      setInitMessage({ type: 'error', text: `저장 실패: ${error.message}` });
    }
    setIsSaving(false);
  };

  useEffect(() => {
    if (initMessage) {
      const timer = setTimeout(() => setInitMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [initMessage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">🔧 시스템 설정</h1>
        <p className="text-gray-600 mt-1">시스템 전반적인 설정을 관리합니다</p>
      </div>

      {initMessage && (
        <div
          className={`neo-card p-4 rounded-lg ${
            initMessage.type === 'success' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
          }`}
        >
          <p className="font-bold">{initMessage.text}</p>
        </div>
      )}

      <Card className="border-4 border-orange-400 bg-orange-50">
        <CardHeader>
          <CardTitle>🔥 Firebase 데이터 초기화</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-bold">데이터 상태:</span>
              {isDataInitialized === null ? (
                <span className="neo-badge bg-gray-200 px-3 py-1 rounded-full">확인 중...</span>
              ) : isDataInitialized ? (
                <span className="neo-badge bg-green-400 px-3 py-1 rounded-full">✅ 초기화됨</span>
              ) : (
                <span className="neo-badge bg-red-400 px-3 py-1 rounded-full">❌ 미초기화</span>
              )}
            </div>

            <p className="text-sm text-gray-600">
              시간표 데이터를 Firebase Firestore에 업로드합니다.
              <br />
              처음 배포 시 한 번 실행해주세요.
            </p>

            <div className="p-3 bg-yellow-100 rounded-lg border-2 border-yellow-400">
              <p className="text-sm font-semibold">
                ⚠️ 초기화하면 모든 시간표가 기본 데이터로 덮어씁니다.
              </p>
            </div>

            <Button
              onClick={handleInitialize}
              disabled={isInitializing}
              className="bg-orange-400 hover:bg-orange-500"
            >
              {isInitializing ? '초기화 중...' : '🚀 데이터 초기화 실행'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🔐 특별코드 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              회원가입 시 필요한 특별코드입니다. 교직원에게만 공유해주세요.
            </p>
            <Input
              label="특별코드"
              value={specialCode}
              onChange={(e) => setSpecialCode(e.target.value)}
              maxLength={8}
              placeholder="8자리 숫자"
            />
            <div className="mt-4 p-3 bg-[#FF6B6B]/10 rounded-lg">
              <p className="text-sm font-semibold text-[#FF6B6B]">
                ⚠️ 코드 변경 시 기존에 공유된 코드는 더 이상 사용할 수 없습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📅 학기 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              현재 학년도와 학기를 설정합니다. 시간표 조회에 영향을 줍니다.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">학년도</label>
                <Input
                  type="number"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                  min={2020}
                  max={2030}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">학기</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentSemester(1)}
                    className={`
                      neo-button flex-1 px-4 py-2 rounded-lg font-bold
                      ${currentSemester === 1
                        ? 'bg-[#FFE135] shadow-[4px_4px_0px_#000]'
                        : 'bg-white'
                      }
                    `}
                  >
                    1학기
                  </button>
                  <button
                    onClick={() => setCurrentSemester(2)}
                    className={`
                      neo-button flex-1 px-4 py-2 rounded-lg font-bold
                      ${currentSemester === 2
                        ? 'bg-[#4ECDC4] shadow-[4px_4px_0px_#000]'
                        : 'bg-white'
                      }
                    `}
                  >
                    2학기
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📝 도덕 수업 대상 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FFE135]/20 rounded-xl border-3 border-[#FFE135]">
              <h3 className="font-bold text-lg mb-2">1학기 도덕 대상</h3>
              <div className="flex gap-2">
                <span className="neo-badge bg-white px-3 py-1 rounded-full">2학년</span>
                <span className="neo-badge bg-white px-3 py-1 rounded-full">4학년</span>
                <span className="neo-badge bg-white px-3 py-1 rounded-full">6학년</span>
              </div>
            </div>
            <div className="p-4 bg-[#4ECDC4]/20 rounded-xl border-3 border-[#4ECDC4]">
              <h3 className="font-bold text-lg mb-2">2학기 도덕 대상</h3>
              <div className="flex gap-2">
                <span className="neo-badge bg-white px-3 py-1 rounded-full">1학년</span>
                <span className="neo-badge bg-white px-3 py-1 rounded-full">3학년</span>
                <span className="neo-badge bg-white px-3 py-1 rounded-full">5학년</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? '저장 중...' : '설정 저장'}
        </Button>
      </div>
    </div>
  );
}
