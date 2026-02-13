'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, Modal } from '@/components/ui';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  getCurriculumScheduleItems,
  addCurriculumScheduleItem,
  updateCurriculumScheduleItem,
  deleteCurriculumScheduleItem,
  INITIAL_SCHEDULE_DATA,
} from '@/lib/firebase/curriculumScheduleService';
import type { CurriculumScheduleItem } from '@/types';
import { MONTHS, MONTH_LABELS } from '@/types';

const GRADES = [1, 2, 3, 4, 5, 6] as const;
const CURRENT_YEAR = 2026;

export default function CurriculumActivitiesPage() {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CurriculumScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CurriculumScheduleItem | null>(null);
  const [formData, setFormData] = useState<Omit<CurriculumScheduleItem, 'id' | 'year' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'linkedEventId'>>({
    month: 3,
    startDate: '',
    endDate: '',
    activityName: '',
    gradeHours: { grade1: null, grade2: null, grade3: null, grade4: null, grade5: null, grade6: null },
    subject: '',
    notes: '',
  });

  const filteredItems = items.filter((item) => item.month === selectedMonth);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCurriculumScheduleItems(CURRENT_YEAR);
      if (data.length === 0) {
        setItems([]);
      } else {
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to load curriculum schedule:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      month: selectedMonth,
      startDate: '',
      endDate: '',
      activityName: '',
      gradeHours: { grade1: null, grade2: null, grade3: null, grade4: null, grade5: null, grade6: null },
      subject: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: CurriculumScheduleItem) => {
    setEditingItem(item);
    setFormData({
      month: item.month,
      startDate: item.startDate,
      endDate: item.endDate || '',
      activityName: item.activityName,
      gradeHours: { ...item.gradeHours },
      subject: item.subject,
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.activityName.trim() || !formData.startDate) {
      alert('활동명과 시작일을 입력해주세요.');
      return;
    }

    const userId = firebaseUser?.uid || user?.uid;
    if (!userId) {
      alert('로그인이 필요합니다. 페이지를 새로고침 해주세요.');
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await updateCurriculumScheduleItem(editingItem.id, {
          ...formData,
          endDate: formData.endDate || '',
        }, userId);
      } else {
        await addCurriculumScheduleItem({
          ...formData,
          endDate: formData.endDate || '',
          year: CURRENT_YEAR,
        }, userId);
      }
      await loadItems();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem || !confirm('이 일정을 삭제하시겠습니까?')) return;

    setSaving(true);
    try {
      await deleteCurriculumScheduleItem(editingItem.id);
      await loadItems();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeData = async () => {
    console.log('[DEBUG] handleInitializeData called');
    console.log('[DEBUG] firebaseUser:', firebaseUser);
    console.log('[DEBUG] firebaseUser?.uid:', firebaseUser?.uid);
    console.log('[DEBUG] user:', user);
    console.log('[DEBUG] user?.uid:', user?.uid);
    
    const userId = firebaseUser?.uid || user?.uid;
    console.log('[DEBUG] resolved userId:', userId);
    
    if (!userId) {
      alert('로그인이 필요합니다. 페이지를 새로고침 해주세요.');
      return;
    }

    if (!confirm('초기 데이터(45개 일정)를 생성하시겠습니까?\n기존 데이터가 없을 때만 사용하세요.')) {
      return;
    }
    setSaving(true);
    try {
      console.log('[DEBUG] Starting to create items with userId:', userId);
      for (const item of INITIAL_SCHEDULE_DATA) {
        await addCurriculumScheduleItem({
          ...item,
          year: CURRENT_YEAR,
        }, userId);
      }
      await loadItems();
      alert('초기 데이터가 생성되었습니다.');
    } catch (error) {
      console.error('[DEBUG] Failed to initialize data:', error);
      alert(`초기화에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  };

  const formatDateDisplay = (startDate: string, endDate?: string) => {
    if (!startDate) return '-';
    const start = new Date(startDate);
    const startStr = `${start.getMonth() + 1}.${start.getDate()}(${['일', '월', '화', '수', '목', '금', '토'][start.getDay()]})`;
    
    if (endDate) {
      const end = new Date(endDate);
      const endStr = `${end.getMonth() + 1}.${end.getDate()}(${['일', '월', '화', '수', '목', '금', '토'][end.getDay()]})`;
      return `${startStr}~${endStr}`;
    }
    return startStr;
  };

  const updateGradeHours = (grade: number, value: string) => {
    const numValue = value === '' ? null : parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      gradeHours: {
        ...prev.gradeHours,
        [`grade${grade}`]: numValue,
      },
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📋</div>
          <p className="font-bold text-xl">교육활동 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">📋 교육활동 반영계획</h1>
          <p className="text-gray-600 mt-1">{CURRENT_YEAR}학년도 학교 교육활동 일정표</p>
        </div>
        <div className="flex gap-2">
          {items.length === 0 && (
            <Button variant="secondary" onClick={handleInitializeData} disabled={saving}>
              {saving ? '생성 중...' : '초기 데이터 생성'}
            </Button>
          )}
          <Button onClick={handleAddNew} disabled={saving}>+ 일정 추가</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex flex-wrap border-b-3 border-[#1A1A2E]">
          {MONTHS.map((month) => {
            const count = items.filter((i) => i.month === month).length;
            return (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`
                  px-4 py-3 font-bold text-sm transition-all flex-1 min-w-[80px]
                  ${selectedMonth === month
                    ? 'bg-[#1A1A2E] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-[#1A1A2E]'
                  }
                `}
              >
                {MONTH_LABELS[month]}
                {count > 0 && (
                  <span className={`ml-1 text-xs ${selectedMonth === month ? 'text-yellow-300' : 'text-gray-500'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">{MONTH_LABELS[selectedMonth]} 교육활동</span>
          <span className="text-sm opacity-90">{filteredItems.length}개 일정</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-[#1A1A2E] px-3 py-2 min-w-[140px]">일자</th>
                <th className="border-2 border-[#1A1A2E] px-3 py-2 min-w-[200px]">학교 교육활동</th>
                {GRADES.map((g) => (
                  <th key={g} className="border-2 border-[#1A1A2E] px-2 py-2 w-12 bg-[#e3f2fd] text-[#1565c0]">
                    {g}학년
                  </th>
                ))}
                <th className="border-2 border-[#1A1A2E] px-3 py-2 min-w-[120px]">반영교과</th>
                <th className="border-2 border-[#1A1A2E] px-3 py-2 min-w-[150px]">비고</th>
                <th className="border-2 border-[#1A1A2E] px-3 py-2 w-20">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border-2 border-[#1A1A2E] px-4 py-8 text-center text-gray-500">
                    {selectedMonth}월 일정이 없습니다.
                    {items.length === 0 && (
                      <div className="mt-2">
                        <span className="text-sm">데이터가 없습니다. 위의 &quot;초기 데이터 생성&quot; 버튼을 클릭하세요.</span>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border-2 border-[#1A1A2E] px-3 py-2 text-center font-medium">
                      {formatDateDisplay(item.startDate, item.endDate)}
                    </td>
                    <td className="border-2 border-[#1A1A2E] px-3 py-2 font-medium">
                      {item.activityName}
                    </td>
                    {GRADES.map((g) => (
                      <td key={g} className="border-2 border-[#1A1A2E] px-2 py-2 text-center">
                        {item.gradeHours[`grade${g}` as keyof typeof item.gradeHours] ?? 'ㆍ'}
                      </td>
                    ))}
                    <td className="border-2 border-[#1A1A2E] px-3 py-2 text-center text-xs">
                      {item.subject}
                    </td>
                    <td className="border-2 border-[#1A1A2E] px-3 py-2 text-xs text-gray-600">
                      {item.notes || '-'}
                    </td>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 text-center">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 py-1 bg-[#FFE135] rounded-lg font-bold text-xs hover:bg-[#FFD700] transition-all border-2 border-[#1A1A2E]"
                        disabled={saving}
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="bg-[#e8f4f8] border-l-4 border-[#3498db]">
        <div className="font-bold mb-2">💡 안내</div>
        <ul className="text-sm space-y-1 text-[#2980b9]">
          <li>• 학년별 시수가 없는 경우 &apos;ㆍ&apos;로 표시됩니다.</li>
          <li>• 기간이 있는 일정은 시작일~종료일 형태로 표시됩니다.</li>
          <li>• 수정된 일정은 자동으로 학사일정 캘린더와 연동됩니다.</li>
        </ul>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingItem ? '일정 수정' : '일정 추가'}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block font-bold mb-2">활동명 *</label>
            <Input
              value={formData.activityName}
              onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
              placeholder="예: 학교폭력예방교육주간"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">시작일 *</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setFormData({
                    ...formData,
                    startDate: e.target.value,
                    month: date.getMonth() + 1,
                  });
                }}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block font-bold mb-2">종료일 (기간인 경우)</label>
              <Input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">학년별 시수</label>
            <div className="grid grid-cols-6 gap-2">
              {GRADES.map((g) => (
                <div key={g} className="text-center">
                  <div className="text-xs font-bold mb-1 text-[#1565c0]">{g}학년</div>
                  <Input
                    type="number"
                    min={0}
                    value={formData.gradeHours[`grade${g}` as keyof typeof formData.gradeHours] ?? ''}
                    onChange={(e) => updateGradeHours(g, e.target.value)}
                    placeholder="ㆍ"
                    className="text-center"
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">비워두면 &apos;ㆍ&apos;로 표시됩니다.</p>
          </div>

          <div>
            <label className="block font-bold mb-2">반영교과</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="예: 교과 또는 창체"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block font-bold mb-2">비고</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="추가 설명"
              className="w-full p-3 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE135] min-h-[60px]"
              disabled={saving}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <Button onClick={handleSave} className="flex-1" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
            {editingItem && (
              <Button variant="danger" onClick={handleDelete} className="flex-1" disabled={saving}>
                {saving ? '삭제 중...' : '삭제'}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1" disabled={saving}>
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
