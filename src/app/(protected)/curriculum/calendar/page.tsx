'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, Modal } from '@/components/ui';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  getAnnualCalendarData,
  saveAnnualCalendarData,
  initializeAnnualCalendarData,
  syncAllEventsToCalendar,
  formatDateKorean,
  type AnnualCalendarData,
  type AcademicEvent,
  type SchoolDays,
} from '@/lib/firebase/annualCalendarService';

const CURRENT_YEAR = 2026;

export default function AnnualCalendarPage() {
  const { user, firebaseUser } = useAuth();
  const [data, setData] = useState<AnnualCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    endDate: '',
    time: '',
    notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let fetchedData = await getAnnualCalendarData(CURRENT_YEAR);
      if (!fetchedData) {
        fetchedData = initializeAnnualCalendarData();
      }
      setData(fetchedData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    const userId = firebaseUser?.uid || user?.uid;
    if (!data || !userId) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    setSaving(true);
    try {
      await saveAnnualCalendarData(data, userId);
      setHasChanges(false);
      alert('저장되었습니다!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncToCalendar = async () => {
    const userId = firebaseUser?.uid || user?.uid;
    if (!data || !userId) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    if (!confirm('모든 학사일정을 학사일정 캘린더에 동기화하시겠습니까?')) {
      return;
    }
    
    setSaving(true);
    try {
      const updatedEvents = await syncAllEventsToCalendar(data.events, userId);
      const newData = { ...data, events: updatedEvents };
      setData(newData);
      await saveAnnualCalendarData(newData, userId);
      setHasChanges(false);
      alert('학사일정 캘린더에 동기화되었습니다!');
    } catch (error) {
      console.error('Failed to sync:', error);
      alert('동기화에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setFormData({ name: '', date: '', endDate: '', time: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: AcademicEvent) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      date: event.date,
      endDate: event.endDate || '',
      time: event.time || '',
      notes: event.notes,
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (!data || !formData.name.trim() || !formData.date) {
      alert('행사명과 날짜를 입력해주세요.');
      return;
    }

    const newEvent: AcademicEvent = {
      id: editingEvent?.id || `event-${Date.now()}`,
      name: formData.name,
      date: formData.date,
      endDate: formData.endDate || undefined,
      time: formData.time || undefined,
      notes: formData.notes,
      linkedEventId: editingEvent?.linkedEventId,
    };

    if (editingEvent) {
      setData({
        ...data,
        events: data.events.map(e => e.id === editingEvent.id ? newEvent : e),
      });
    } else {
      setData({
        ...data,
        events: [...data.events, newEvent],
      });
    }
    
    setHasChanges(true);
    setIsModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (!data || !editingEvent || !confirm('이 행사를 삭제하시겠습니까?')) return;
    
    setData({
      ...data,
      events: data.events.filter(e => e.id !== editingEvent.id),
    });
    setHasChanges(true);
    setIsModalOpen(false);
  };

  const handleSchoolDaysChange = (
    semester: 'semester1' | 'semester2',
    field: string,
    value: number
  ) => {
    if (!data) return;
    
    setData(prev => {
      if (!prev) return prev;
      const newData = { ...prev };
      (newData.schoolDays[semester] as any)[field] = value;
      
      if (semester === 'semester1') {
        const s1 = newData.schoolDays.semester1;
        s1.total = s1.march + s1.april + s1.may + s1.june + s1.july;
      } else {
        const s2 = newData.schoolDays.semester2;
        s2.total = s2.august + s2.september + s2.october + s2.november + s2.december + s2.january + s2.february;
      }
      
      newData.schoolDays.totalSchoolDays = 
        newData.schoolDays.semester1.total + 
        newData.schoolDays.semester2.total + 
        newData.schoolDays.semester1.discretionaryDays + 
        newData.schoolDays.semester2.discretionaryDays;
      
      return newData;
    });
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📅</div>
          <p className="font-bold text-xl">연간학사일정 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-bold text-red-500">데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">📅 {CURRENT_YEAR}학년도 학사일정</h1>
          <p className="text-gray-600 mt-1">연간 주요 학사일정 및 수업일수 현황</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleSyncToCalendar}
            disabled={saving}
          >
            🔄 캘린더 동기화
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            variant={hasChanges ? 'primary' : 'secondary'}
          >
            {saving ? '저장 중...' : hasChanges ? '💾 변경사항 저장' : '✓ 저장됨'}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">📋 주요 학사일정</span>
          <Button variant="secondary" onClick={handleAddEvent} className="!py-1 !px-3 !text-sm">
            + 행사 추가
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-[#1A1A2E] px-4 py-3 text-left min-w-[150px]">행 사 명</th>
                <th className="border-2 border-[#1A1A2E] px-4 py-3 text-center min-w-[300px]">날 짜</th>
                <th className="border-2 border-[#1A1A2E] px-4 py-3 text-center min-w-[200px]">비 고</th>
                <th className="border-2 border-[#1A1A2E] px-4 py-3 text-center w-20">관리</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="border-2 border-[#1A1A2E] px-4 py-3 font-medium">{event.name}</td>
                  <td className="border-2 border-[#1A1A2E] px-4 py-3 text-center">
                    {formatDateKorean(event.date)}
                    {event.time && ` ${event.time}`}
                    {event.endDate && ` - ${formatDateKorean(event.endDate)}`}
                  </td>
                  <td className="border-2 border-[#1A1A2E] px-4 py-3 text-center text-gray-600">
                    {event.notes || '-'}
                  </td>
                  <td className="border-2 border-[#1A1A2E] px-2 py-2 text-center">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="px-2 py-1 bg-[#FFE135] rounded-lg font-bold text-xs hover:bg-[#FFD700] transition-all border-2 border-[#1A1A2E]"
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#f093fb] to-[#f5576c] text-white px-4 py-3">
          <span className="font-bold text-lg">📊 수업일수 현황</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={2} className="border-2 border-[#1A1A2E] px-3 py-2 w-20">구분</th>
                <th colSpan={5} className="border-2 border-[#1A1A2E] px-3 py-2 bg-[#e3f2fd]">1학기</th>
                <th rowSpan={2} className="border-2 border-[#1A1A2E] px-3 py-2 bg-[#fff9c4] w-16">계</th>
                <th rowSpan={2} className="border-2 border-[#1A1A2E] px-3 py-2 bg-[#ffecb3] w-20">학교장<br/>재량일수</th>
                <th rowSpan={2} className="border-2 border-[#1A1A2E] px-3 py-2 bg-[#c8e6c9] w-20">총수업<br/>일수</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border-2 border-[#1A1A2E] px-2 py-1">3월</th>
                <th className="border-2 border-[#1A1A2E] px-2 py-1">4월</th>
                <th className="border-2 border-[#1A1A2E] px-2 py-1">5월</th>
                <th className="border-2 border-[#1A1A2E] px-2 py-1">6월</th>
                <th className="border-2 border-[#1A1A2E] px-2 py-1">7월</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-2 border-[#1A1A2E] px-3 py-2 font-bold text-center bg-[#e3f2fd]">1학기</td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester1.march} onChange={(v) => handleSchoolDaysChange('semester1', 'march', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester1.april} onChange={(v) => handleSchoolDaysChange('semester1', 'april', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester1.may} onChange={(v) => handleSchoolDaysChange('semester1', 'may', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester1.june} onChange={(v) => handleSchoolDaysChange('semester1', 'june', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester1.july} onChange={(v) => handleSchoolDaysChange('semester1', 'july', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] px-3 py-2 text-center font-bold bg-[#fff9c4]">
                  {data.schoolDays.semester1.total}
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester1.discretionaryDays} onChange={(v) => handleSchoolDaysChange('semester1', 'discretionaryDays', v)} />
                </td>
                <td rowSpan={2} className="border-2 border-[#1A1A2E] px-3 py-2 text-center font-black text-xl bg-[#c8e6c9]">
                  {data.schoolDays.totalSchoolDays}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={2} className="border-2 border-[#1A1A2E] px-3 py-2 w-20">구분</th>
                <th colSpan={7} className="border-2 border-[#1A1A2E] px-3 py-2 bg-[#fce4ec]">2학기</th>
                <th rowSpan={2} className="border-2 border-[#1A1A2E] px-3 py-2 bg-[#fff9c4] w-16">계</th>
                <th rowSpan={2} className="border-2 border-[#1A1A2E] px-3 py-2 bg-[#ffecb3] w-20">학교장<br/>재량일수</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border-2 border-[#1A1A2E] px-2 py-1">8월</th>
                <th className="border-2 border-[#1A1A2E] px-2 py-1">9월</th>
                <th className="border-2 border-[#1A1A2E] px-2 py-1">10월</th>
                <th className="border-2 border-[#1A1A2E] px-2 py-1">11월</th>
                <th className="border-2 border-[#1A1A2E] px-2 py-1">12월</th>
                <th className="border-2 border-[#1A1A2E] px-2 py-1">1월</th>
                <th className="border-2 border-[#1A1A2E] px-2 py-1">2월</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-2 border-[#1A1A2E] px-3 py-2 font-bold text-center bg-[#fce4ec]">2학기</td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.august} onChange={(v) => handleSchoolDaysChange('semester2', 'august', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.september} onChange={(v) => handleSchoolDaysChange('semester2', 'september', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.october} onChange={(v) => handleSchoolDaysChange('semester2', 'october', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.november} onChange={(v) => handleSchoolDaysChange('semester2', 'november', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.december} onChange={(v) => handleSchoolDaysChange('semester2', 'december', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.january} onChange={(v) => handleSchoolDaysChange('semester2', 'january', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.february} onChange={(v) => handleSchoolDaysChange('semester2', 'february', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] px-3 py-2 text-center font-bold bg-[#fff9c4]">
                  {data.schoolDays.semester2.total}
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.discretionaryDays} onChange={(v) => handleSchoolDaysChange('semester2', 'discretionaryDays', v)} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="bg-[#e8f4f8] border-l-4 border-[#3498db]">
        <div className="font-bold mb-2">💡 안내</div>
        <ul className="text-sm space-y-1 text-[#2980b9]">
          <li>• 행사 수정 후 &quot;변경사항 저장&quot; 버튼을 클릭하세요.</li>
          <li>• &quot;캘린더 동기화&quot; 버튼을 클릭하면 학사일정 캘린더(/calendar)에 일정이 반영됩니다.</li>
          <li>• 수업일수는 자동으로 합계가 계산됩니다.</li>
        </ul>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? '행사 수정' : '행사 추가'}
      >
        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-2">행사명 *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 입학식, 여름방학식"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">날짜 *</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold mb-2">종료일 (기간인 경우)</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">시간 (선택)</label>
            <Input
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="예: 10:00"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">비고</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="추가 설명"
              className="w-full p-3 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE135] min-h-[60px]"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <Button onClick={handleSaveEvent} className="flex-1">
              저장
            </Button>
            {editingEvent && (
              <Button variant="danger" onClick={handleDeleteEvent} className="flex-1">
                삭제
              </Button>
            )}
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DaysInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      max={31}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="w-full px-2 py-1 text-center border-2 border-gray-300 rounded-lg font-bold
                 focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/30 focus:outline-none
                 transition-all"
    />
  );
}
