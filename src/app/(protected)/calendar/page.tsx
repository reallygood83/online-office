'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  SchoolEvent, 
  EventCategory, 
  EVENT_CATEGORY_LABELS, 
  EVENT_CATEGORY_COLORS 
} from '@/types';
import { 
  getSchoolEvents, 
  addSchoolEvent, 
  updateSchoolEvent, 
  deleteSchoolEvent 
} from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    endDate: '',
    category: 'academic' as EventCategory,
    description: '',
    isHoliday: false,
  });
  const [saving, setSaving] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadEvents();
  }, [year, month]);

  async function loadEvents() {
    setLoading(true);
    try {
      const data = await getSchoolEvents(year, month + 1);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  }

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, SchoolEvent[]> = {};
    events.forEach(event => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    return map;
  }, [events]);

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  function handleDateClick(day: number) {
    if (!user?.isAdmin) return;
    
    const dateStr = formatDateString(year, month, day);
    setSelectedDate(dateStr);
    setEditingEvent(null);
    setFormData({
      title: '',
      date: dateStr,
      endDate: '',
      category: 'academic',
      description: '',
      isHoliday: false,
    });
    setIsModalOpen(true);
  }

  function handleEventClick(event: SchoolEvent, e: React.MouseEvent) {
    e.stopPropagation();
    if (!user?.isAdmin) return;
    
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      endDate: event.endDate || '',
      category: event.category,
      description: event.description || '',
      isHoliday: event.isHoliday ?? false,
    });
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.date) {
      alert('일정 제목과 날짜를 입력해주세요.');
      return;
    }

    if (!user) return;

    setSaving(true);
    try {
      if (editingEvent) {
        await updateSchoolEvent(editingEvent.id, {
          title: formData.title,
          date: formData.date,
          endDate: formData.endDate || undefined,
          category: formData.category,
          description: formData.description || undefined,
          isHoliday: formData.isHoliday,
        });
      } else {
        await addSchoolEvent({
          title: formData.title,
          date: formData.date,
          endDate: formData.endDate || undefined,
          category: formData.category,
          description: formData.description || undefined,
          isHoliday: formData.isHoliday,
          createdBy: user.uid,
        });
      }
      await loadEvents();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingEvent || !confirm('이 일정을 삭제하시겠습니까?')) return;

    try {
      await deleteSchoolEvent(editingEvent.id);
      await loadEvents();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('삭제에 실패했습니다.');
    }
  }

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">📅 학사일정</h1>
        {user?.isAdmin && (
          <Button onClick={() => {
            const todayStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
            setSelectedDate(todayStr);
            setEditingEvent(null);
            setFormData({
              title: '',
              date: todayStr,
              endDate: '',
              category: 'academic',
              description: '',
              isHoliday: false,
            });
            setIsModalOpen(true);
          }}>
            + 일정 추가
          </Button>
        )}
      </div>

      <div className="neo-card p-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="secondary" onClick={handlePrevMonth}>
            ◀ 이전달
          </Button>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black">
              {year}년 {month + 1}월
            </h2>
            <Button variant="secondary" onClick={handleToday}>
              오늘
            </Button>
          </div>
          <Button variant="secondary" onClick={handleNextMonth}>
            다음달 ▶
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">로딩중...</div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`p-2 text-center font-bold border-b-3 border-black ${
                  i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''
                }`}
              >
                {label}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-2 min-h-[100px] bg-gray-50" />;
              }

              const dateStr = formatDateString(year, month, day);
              const dayEvents = eventsByDate[dateStr] || [];
              const dayOfWeek = (getFirstDayOfMonth(year, month) + day - 1) % 7;
              const hasHoliday = dayEvents.some(e => e.isHoliday);

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`p-2 min-h-[100px] border border-gray-200 transition-all ${
                    user?.isAdmin ? 'cursor-pointer hover:bg-gray-50' : ''
                  } ${isToday(day) ? 'bg-yellow-100 border-yellow-400 border-2' : ''}`}
                >
                  <div
                    className={`font-bold mb-1 ${
                      hasHoliday || dayOfWeek === 0
                        ? 'text-red-500'
                        : dayOfWeek === 6
                        ? 'text-blue-500'
                        : ''
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => handleEventClick(event, e)}
                        className={`text-xs p-1 rounded truncate ${EVENT_CATEGORY_COLORS[event.category]} ${
                          user?.isAdmin ? 'cursor-pointer hover:opacity-80' : ''
                        } ${event.isHoliday ? 'font-bold' : ''}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 3}개 더
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="neo-card p-4">
        <h3 className="font-bold mb-3">📌 분류 안내</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(EVENT_CATEGORY_LABELS).map(([key, label]) => (
            <span
              key={key}
              className={`px-3 py-1 rounded-full text-sm font-bold border-2 border-black ${
                EVENT_CATEGORY_COLORS[key as EventCategory]
              }`}
            >
              {label}
            </span>
          ))}
        </div>
        {!user?.isAdmin && (
          <p className="text-sm text-gray-500 mt-3">
            💡 일정 추가/수정은 관리자만 가능합니다.
          </p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? '일정 수정' : '일정 추가'}
      >
        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-2">일정 제목 *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 입학식, 중간고사"
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
              <label className="block font-bold mb-2">종료일 (선택)</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">분류</label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
              options={Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>

          <div>
            <label className="block font-bold mb-2">상세 설명 (선택)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="추가 설명을 입력하세요"
              className="w-full p-3 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE135] min-h-[80px]"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isHoliday"
              checked={formData.isHoliday}
              onChange={(e) => setFormData({ ...formData, isHoliday: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="isHoliday" className="font-bold">휴일 (날짜 빨간색 표시)</label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? '저장중...' : '저장'}
            </Button>
            {editingEvent && (
              <Button variant="danger" onClick={handleDelete} className="flex-1">
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
