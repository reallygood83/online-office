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
  type TimetableData,
  type WeeklyHoursData,
  type WeeklyHoursRow,
} from '@/lib/firebase/annualCalendarService';

const CURRENT_YEAR = 2026;

type TabType = 'schedule' | 'timetable' | 'weeklyHours';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'schedule', label: '학사일정', icon: '📅' },
  { id: 'timetable', label: '시정표', icon: '⏰' },
  { id: 'weeklyHours', label: '요일별 시수', icon: '📊' },
];

export default function AnnualCalendarPage() {
  const { user, firebaseUser } = useAuth();
  const [data, setData] = useState<AnnualCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
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
      const defaultData = initializeAnnualCalendarData();
      
      if (!fetchedData) {
        fetchedData = defaultData;
      } else {
        fetchedData = {
          ...defaultData,
          ...fetchedData,
          timetable: fetchedData.timetable || defaultData.timetable,
          weeklyHours: fetchedData.weeklyHours || defaultData.weeklyHours,
        };
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
          <p className="text-gray-600 mt-1">연간 주요 학사일정, 시정표, 요일별 시수</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'schedule' && (
            <Button
              variant="secondary"
              onClick={handleSyncToCalendar}
              disabled={saving}
            >
              🔄 캘린더 동기화
            </Button>
          )}
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
        <div className="flex border-b-3 border-[#1A1A2E]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-6 py-4 font-bold text-lg transition-all flex items-center justify-center gap-2
                ${activeTab === tab.id
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-[#1A1A2E]'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {activeTab === 'schedule' && (
        <ScheduleTab
          data={data}
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
          onSchoolDaysChange={handleSchoolDaysChange}
        />
      )}

      {activeTab === 'timetable' && (
        <TimetableTab
          data={data.timetable}
          onDataChange={(newTimetable: TimetableData) => {
            setData({ ...data, timetable: newTimetable });
            setHasChanges(true);
          }}
        />
      )}

      {activeTab === 'weeklyHours' && (
        <WeeklyHoursTab
          data={data.weeklyHours}
          onDataChange={(newWeeklyHours: WeeklyHoursData) => {
            setData({ ...data, weeklyHours: newWeeklyHours });
            setHasChanges(true);
          }}
        />
      )}

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

function ScheduleTab({
  data,
  onAddEvent,
  onEditEvent,
  onSchoolDaysChange,
}: {
  data: AnnualCalendarData;
  onAddEvent: () => void;
  onEditEvent: (event: AcademicEvent) => void;
  onSchoolDaysChange: (semester: 'semester1' | 'semester2', field: string, value: number) => void;
}) {
  return (
    <>
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">📋 주요 학사일정</span>
          <Button variant="secondary" onClick={onAddEvent} className="!py-1 !px-3 !text-sm">
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
                      onClick={() => onEditEvent(event)}
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
        <div className="overflow-x-auto p-4">
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
                  <DaysInput value={data.schoolDays.semester1.march} onChange={(v) => onSchoolDaysChange('semester1', 'march', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester1.april} onChange={(v) => onSchoolDaysChange('semester1', 'april', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester1.may} onChange={(v) => onSchoolDaysChange('semester1', 'may', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester1.june} onChange={(v) => onSchoolDaysChange('semester1', 'june', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester1.july} onChange={(v) => onSchoolDaysChange('semester1', 'july', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] px-3 py-2 text-center font-bold bg-[#fff9c4]">
                  {data.schoolDays.semester1.total}
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester1.discretionaryDays} onChange={(v) => onSchoolDaysChange('semester1', 'discretionaryDays', v)} />
                </td>
                <td rowSpan={2} className="border-2 border-[#1A1A2E] px-3 py-2 text-center font-black text-xl bg-[#c8e6c9]">
                  {data.schoolDays.totalSchoolDays}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full text-sm mt-4">
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
                  <DaysInput value={data.schoolDays.semester2.august} onChange={(v) => onSchoolDaysChange('semester2', 'august', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.september} onChange={(v) => onSchoolDaysChange('semester2', 'september', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.october} onChange={(v) => onSchoolDaysChange('semester2', 'october', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.november} onChange={(v) => onSchoolDaysChange('semester2', 'november', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.december} onChange={(v) => onSchoolDaysChange('semester2', 'december', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.january} onChange={(v) => onSchoolDaysChange('semester2', 'january', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.february} onChange={(v) => onSchoolDaysChange('semester2', 'february', v)} />
                </td>
                <td className="border-2 border-[#1A1A2E] px-3 py-2 text-center font-bold bg-[#fff9c4]">
                  {data.schoolDays.semester2.total}
                </td>
                <td className="border-2 border-[#1A1A2E] p-1">
                  <DaysInput value={data.schoolDays.semester2.discretionaryDays} onChange={(v) => onSchoolDaysChange('semester2', 'discretionaryDays', v)} />
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
    </>
  );
}

function TimetableTab({
  data,
  onDataChange,
}: {
  data: TimetableData;
  onDataChange: (data: TimetableData) => void;
}) {
  const handleArrivalChange = (field: 'arrivalTime' | 'arrivalNote', value: string) => {
    onDataChange({ ...data, [field]: value });
  };

  const handleSlotChange = (
    group: 'lowerGrades' | 'upperGrades',
    index: number,
    field: 'period' | 'time' | 'notes',
    value: string
  ) => {
    const newSlots = [...data[group]];
    newSlots[index] = { ...newSlots[index], [field]: value };
    onDataChange({ ...data, [group]: newSlots });
  };

  const handleLunchChange = (
    group: 'lunchLower' | 'lunchUpper',
    field: 'time' | 'schedule',
    value: string | string[]
  ) => {
    onDataChange({
      ...data,
      [group]: { ...data[group], [field]: value },
    });
  };

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#4ECDC4] to-[#556270] text-white px-4 py-3">
          <span className="font-bold text-lg">⏰ 우리학교 시정표</span>
        </div>
        <div className="p-4">
          <div className="mb-4 p-3 bg-[#fff3e0] rounded-xl border-2 border-[#ff9800]">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-[#e65100]">🚌 등교시간:</span>
              <input
                type="text"
                value={data.arrivalTime}
                onChange={(e) => handleArrivalChange('arrivalTime', e.target.value)}
                className="px-2 py-1 border-2 border-[#ff9800] rounded-lg font-bold text-center w-32"
              />
              <span className="text-sm text-[#f57c00]">(※</span>
              <input
                type="text"
                value={data.arrivalNote}
                onChange={(e) => handleArrivalChange('arrivalNote', e.target.value)}
                className="px-2 py-1 border-2 border-[#ff9800] rounded-lg text-sm flex-1 min-w-[200px]"
              />
              <span className="text-sm text-[#f57c00]">)</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="border-3 border-[#1A1A2E] px-4 py-3 bg-[#e0f7fa] min-w-[250px]">1,2,3학년</th>
                  <th className="border-3 border-[#1A1A2E] px-4 py-3 bg-[#fffde7] min-w-[250px]">4,5,6학년</th>
                  <th className="border-3 border-[#1A1A2E] px-4 py-3 bg-gray-100 w-24">비고</th>
                </tr>
              </thead>
              <tbody>
                {data.lowerGrades.slice(0, 4).map((slot, idx) => (
                  <tr key={`period-${idx}`}>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 bg-[#e0f7fa]">
                      <div className="flex items-center gap-2 justify-center">
                        <input
                          type="text"
                          value={slot.period}
                          onChange={(e) => handleSlotChange('lowerGrades', idx, 'period', e.target.value)}
                          className="w-16 px-1 py-1 border rounded text-center font-bold"
                        />
                        <input
                          type="text"
                          value={slot.time}
                          onChange={(e) => handleSlotChange('lowerGrades', idx, 'time', e.target.value)}
                          className="w-28 px-1 py-1 border rounded text-center text-gray-600"
                        />
                      </div>
                    </td>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 bg-[#fffde7]">
                      {idx < 3 ? (
                        <div className="flex items-center gap-2 justify-center">
                          <input
                            type="text"
                            value={data.upperGrades[idx]?.period || ''}
                            onChange={(e) => handleSlotChange('upperGrades', idx, 'period', e.target.value)}
                            className="w-16 px-1 py-1 border rounded text-center font-bold"
                          />
                          <input
                            type="text"
                            value={data.upperGrades[idx]?.time || ''}
                            onChange={(e) => handleSlotChange('upperGrades', idx, 'time', e.target.value)}
                            className="w-28 px-1 py-1 border rounded text-center text-gray-600"
                          />
                        </div>
                      ) : idx === 3 ? (
                        <div className="flex items-center gap-2 justify-center">
                          <input
                            type="text"
                            value={data.upperGrades[3]?.period || '4-5교시'}
                            onChange={(e) => handleSlotChange('upperGrades', 3, 'period', e.target.value)}
                            className="w-20 px-1 py-1 border rounded text-center font-bold"
                          />
                          <input
                            type="text"
                            value={data.upperGrades[3]?.time || ''}
                            onChange={(e) => handleSlotChange('upperGrades', 3, 'time', e.target.value)}
                            className="w-28 px-1 py-1 border rounded text-center text-gray-600"
                          />
                        </div>
                      ) : null}
                    </td>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 bg-gray-50 text-center">
                      {idx === 3 && <span className="font-bold text-[#e53935]">블록수업</span>}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="border-2 border-[#1A1A2E] px-3 py-3 bg-[#ffcdd2]">
                    <div className="font-bold text-center mb-2">
                      점심시간 (
                      <input
                        type="text"
                        value={data.lunchLower.time}
                        onChange={(e) => handleLunchChange('lunchLower', 'time', e.target.value)}
                        className="w-28 px-1 border rounded text-center"
                      />
                      )
                    </div>
                    <textarea
                      value={data.lunchLower.schedule.join('\n')}
                      onChange={(e) => handleLunchChange('lunchLower', 'schedule', e.target.value.split('\n'))}
                      className="w-full text-xs p-2 border rounded min-h-[80px]"
                      placeholder="급식 시간표 입력..."
                    />
                  </td>
                  <td className="border-2 border-[#1A1A2E] px-3 py-3 bg-[#ffcdd2]">
                    <div className="font-bold text-center mb-2">
                      점심시간 (
                      <input
                        type="text"
                        value={data.lunchUpper.time}
                        onChange={(e) => handleLunchChange('lunchUpper', 'time', e.target.value)}
                        className="w-28 px-1 border rounded text-center"
                      />
                      )
                    </div>
                    <textarea
                      value={data.lunchUpper.schedule.join('\n')}
                      onChange={(e) => handleLunchChange('lunchUpper', 'schedule', e.target.value.split('\n'))}
                      className="w-full text-xs p-2 border rounded min-h-[80px]"
                      placeholder="급식 시간표 입력..."
                    />
                  </td>
                  <td className="border-2 border-[#1A1A2E] px-2 py-2 bg-gray-50"></td>
                </tr>
                {data.lowerGrades.slice(4).map((slot, idx) => (
                  <tr key={`period-after-lunch-${idx}`}>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 bg-[#e0f7fa]">
                      <div className="flex items-center gap-2 justify-center">
                        <input
                          type="text"
                          value={slot.period}
                          onChange={(e) => handleSlotChange('lowerGrades', idx + 4, 'period', e.target.value)}
                          className="w-16 px-1 py-1 border rounded text-center font-bold"
                        />
                        <input
                          type="text"
                          value={slot.time}
                          onChange={(e) => handleSlotChange('lowerGrades', idx + 4, 'time', e.target.value)}
                          className="w-28 px-1 py-1 border rounded text-center text-gray-600"
                        />
                      </div>
                    </td>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 bg-[#fffde7]">
                      <div className="flex items-center gap-2 justify-center">
                        <input
                          type="text"
                          value={data.upperGrades[idx + 4]?.period || ''}
                          onChange={(e) => handleSlotChange('upperGrades', idx + 4, 'period', e.target.value)}
                          className="w-16 px-1 py-1 border rounded text-center font-bold"
                        />
                        <input
                          type="text"
                          value={data.upperGrades[idx + 4]?.time || ''}
                          onChange={(e) => handleSlotChange('upperGrades', idx + 4, 'time', e.target.value)}
                          className="w-28 px-1 py-1 border rounded text-center text-gray-600"
                        />
                      </div>
                    </td>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 bg-gray-50"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card className="bg-[#fff3e0] border-l-4 border-[#ff9800]">
        <div className="font-bold mb-2">📌 시정표 안내</div>
        <ul className="text-sm space-y-1 text-[#e65100]">
          <li>• 4,5,6학년은 4-5교시를 블록수업으로 운영합니다.</li>
          <li>• 점심시간은 학년군별로 다르게 운영됩니다.</li>
          <li>• 시정표 수정 후 &quot;변경사항 저장&quot; 버튼을 클릭하세요.</li>
        </ul>
      </Card>
    </>
  );
}

function WeeklyHoursTab({
  data,
  onDataChange,
}: {
  data: WeeklyHoursData;
  onDataChange: (data: WeeklyHoursData) => void;
}) {
  const gradeColors: Record<string, string> = {
    '1학년': '#fce4ec',
    '2학년': '#fce4ec',
    '3학년': '#e3f2fd',
    '4학년': '#e3f2fd',
    '5학년': '#e8f5e9',
    '6학년': '#e8f5e9',
  };

  const handleHoursChange = (
    index: number,
    field: 'mon' | 'tue' | 'wed' | 'thu' | 'fri',
    value: string
  ) => {
    const newRows = [...data.rows];
    const numValue = parseInt(value);
    newRows[index] = {
      ...newRows[index],
      [field]: isNaN(numValue) ? value : numValue,
    };
    onDataChange({ ...data, rows: newRows });
  };

  const handleHomeStudyChange = (value: number) => {
    onDataChange({ ...data, homeStudyDays: value });
  };

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#9C27B0] to-[#E91E63] text-white px-4 py-3">
          <span className="font-bold text-lg">📊 요일별 시수</span>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#e0f7fa]">
                <th className="border-3 border-[#1A1A2E] px-4 py-3 min-w-[100px]">학년</th>
                <th className="border-3 border-[#1A1A2E] px-4 py-3 w-20">월</th>
                <th className="border-3 border-[#1A1A2E] px-4 py-3 w-20">화</th>
                <th className="border-3 border-[#1A1A2E] px-4 py-3 w-20">수</th>
                <th className="border-3 border-[#1A1A2E] px-4 py-3 w-20">목</th>
                <th className="border-3 border-[#1A1A2E] px-4 py-3 w-20">금</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, idx) => (
                <tr key={row.grade}>
                  <td
                    className="border-2 border-[#1A1A2E] px-4 py-3 font-bold text-center"
                    style={{ backgroundColor: gradeColors[row.grade] || '#f5f5f5' }}
                  >
                    {row.grade}
                  </td>
                  <td className="border-2 border-[#1A1A2E] p-1">
                    <input
                      type="text"
                      value={row.mon}
                      onChange={(e) => handleHoursChange(idx, 'mon', e.target.value)}
                      className="w-full px-2 py-2 text-center font-bold text-lg border-2 border-gray-300 rounded-lg focus:border-[#9C27B0] focus:outline-none"
                    />
                  </td>
                  <td className="border-2 border-[#1A1A2E] p-1">
                    <input
                      type="text"
                      value={row.tue}
                      onChange={(e) => handleHoursChange(idx, 'tue', e.target.value)}
                      className="w-full px-2 py-2 text-center font-bold text-lg border-2 border-gray-300 rounded-lg focus:border-[#9C27B0] focus:outline-none"
                    />
                  </td>
                  <td className="border-2 border-[#1A1A2E] p-1">
                    <input
                      type="text"
                      value={row.wed}
                      onChange={(e) => handleHoursChange(idx, 'wed', e.target.value)}
                      className="w-full px-2 py-2 text-center font-bold text-lg border-2 border-gray-300 rounded-lg focus:border-[#9C27B0] focus:outline-none"
                    />
                  </td>
                  <td className="border-2 border-[#1A1A2E] p-1">
                    <input
                      type="text"
                      value={row.thu}
                      onChange={(e) => handleHoursChange(idx, 'thu', e.target.value)}
                      className="w-full px-2 py-2 text-center font-bold text-lg border-2 border-gray-300 rounded-lg focus:border-[#9C27B0] focus:outline-none"
                    />
                  </td>
                  <td className="border-2 border-[#1A1A2E] p-1">
                    <input
                      type="text"
                      value={row.fri}
                      onChange={(e) => handleHoursChange(idx, 'fri', e.target.value)}
                      className="w-full px-2 py-2 text-center font-bold text-lg border-2 border-gray-300 rounded-lg focus:border-[#9C27B0] focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="bg-[#f3e5f5] border-l-4 border-[#9c27b0]">
        <div className="font-bold mb-2 flex items-center gap-3">
          📌 가정학습 일수:
          <input
            type="number"
            min={0}
            max={50}
            value={data.homeStudyDays}
            onChange={(e) => handleHomeStudyChange(parseInt(e.target.value) || 0)}
            className="w-20 px-2 py-1 text-center font-bold border-2 border-[#9c27b0] rounded-lg"
          />
          <span className="text-[#7b1fa2]">일</span>
        </div>
        <p className="text-sm text-[#7b1fa2]">
          연간 가정학습 최대 허가 일수를 설정합니다.
        </p>
      </Card>

      <Card className="bg-[#e8f4f8] border-l-4 border-[#3498db]">
        <div className="font-bold mb-2">💡 시수 안내</div>
        <ul className="text-sm space-y-1 text-[#2980b9]">
          <li>• 1학년 금요일 4(5): 격주로 4시간 또는 5시간 운영 시 &quot;4(5)&quot;로 입력</li>
          <li>• 저학년(1-2학년): 주당 23~24시간</li>
          <li>• 중학년(3-4학년): 주당 26시간</li>
          <li>• 고학년(5-6학년): 주당 29시간</li>
          <li>• 시수 수정 후 &quot;변경사항 저장&quot; 버튼을 클릭하세요.</li>
        </ul>
      </Card>
    </>
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
