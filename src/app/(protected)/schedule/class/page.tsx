'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { EditableClassScheduleTable } from '@/components/schedule/ScheduleTable';
import { SemesterSelector } from '@/components/schedule/SemesterSelector';
import { ALL_CLASSES, SUBJECT_BG_COLORS, ClassScheduleData } from '@/data/scheduleData';
import { getClassScheduleFromDB, saveClassSchedule } from '@/lib/firebase/scheduleService';
import { useAuth } from '@/lib/hooks/useAuth';
import { DayOfWeek } from '@/types';

export default function ClassSchedulePage() {
  const { user } = useAuth();
  const [semester, setSemester] = useState<1 | 2>(1);
  const [selectedClass, setSelectedClass] = useState<string>(ALL_CLASSES[0]);
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [schedule, setSchedule] = useState<ClassScheduleData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const gradeClasses: Record<number, string[]> = {
    1: ALL_CLASSES.filter((c) => c.startsWith('1-')),
    2: ALL_CLASSES.filter((c) => c.startsWith('2-')),
    3: ALL_CLASSES.filter((c) => c.startsWith('3-')),
    4: ALL_CLASSES.filter((c) => c.startsWith('4-')),
    5: ALL_CLASSES.filter((c) => c.startsWith('5-')),
    6: ALL_CLASSES.filter((c) => c.startsWith('6-')),
  };

  const loadSchedule = useCallback(async () => {
    const data = await getClassScheduleFromDB(selectedClass, semester);
    setSchedule(data);
    setHasChanges(false);
  }, [selectedClass, semester]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handleGradeChange = (grade: number) => {
    if (hasChanges) {
      if (!confirm('저장하지 않은 변경사항이 있습니다. 계속하시겠습니까?')) return;
    }
    setSelectedGrade(grade);
    setSelectedClass(gradeClasses[grade][0]);
    setIsEditMode(false);
  };

  const handleClassChange = (cls: string) => {
    if (hasChanges) {
      if (!confirm('저장하지 않은 변경사항이 있습니다. 계속하시겠습니까?')) return;
    }
    setSelectedClass(cls);
    setIsEditMode(false);
  };

  const handleSemesterChange = (newSemester: 1 | 2) => {
    if (hasChanges) {
      if (!confirm('저장하지 않은 변경사항이 있습니다. 계속하시겠습니까?')) return;
    }
    setSemester(newSemester);
    setIsEditMode(false);
  };

  const handleCellChange = (day: DayOfWeek, period: number, value: { subject: string; teacher: string } | null) => {
    if (!schedule) return;

    const newSchedule = { ...schedule };
    newSchedule[day] = [...newSchedule[day]];
    newSchedule[day][period] = value;

    setSchedule(newSchedule);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!schedule) return;

    setIsSaving(true);
    try {
      await saveClassSchedule(selectedClass, semester, schedule, user?.uid);
      setHasChanges(false);
      setSaveMessage({ type: 'success', text: '시간표가 저장되었습니다!' });
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: `저장 실패: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (!confirm('변경사항을 취소하시겠습니까?')) return;
    }
    loadSchedule();
    setIsEditMode(false);
  };

  const getTotalHours = () => {
    if (!schedule) return 0;
    let total = 0;
    const days = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;
    days.forEach((day) => {
      schedule[day].forEach((cell) => {
        if (cell) total++;
      });
    });
    return total;
  };

  const getSubjectHours = () => {
    if (!schedule) return {};
    const hours: Record<string, number> = {};
    const days = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;
    days.forEach((day) => {
      schedule[day].forEach((cell) => {
        if (cell) {
          hours[cell.subject] = (hours[cell.subject] || 0) + 1;
        }
      });
    });
    return hours;
  };

  const subjectHours = getSubjectHours();
  const classGrade = parseInt(selectedClass.split('-')[0]);

  if (!schedule) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📅</div>
          <p className="font-bold">시간표 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">🏫 학급별 시간표</h1>
          <p className="text-gray-600 mt-1">학급별 전담 수업 시간표를 확인하고 편집하세요</p>
        </div>
        <SemesterSelector semester={semester} onSemesterChange={handleSemesterChange} />
      </div>

      {saveMessage && (
        <div
          className={`neo-card p-4 rounded-lg ${
            saveMessage.type === 'success' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
          }`}
        >
          <p className="font-bold">{saveMessage.text}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>학년 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <button
                key={grade}
                onClick={() => handleGradeChange(grade)}
                className={`
                  neo-button px-4 py-2 rounded-lg font-bold
                  ${selectedGrade === grade
                    ? 'bg-[#FFE135] shadow-[4px_4px_0px_#000]'
                    : 'bg-white hover:bg-gray-100'
                  }
                `}
              >
                {grade}학년
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{selectedGrade}학년 학급 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {gradeClasses[selectedGrade].map((cls) => (
              <button
                key={cls}
                onClick={() => handleClassChange(cls)}
                className={`
                  neo-button px-4 py-2 rounded-lg font-bold
                  ${selectedClass === cls
                    ? 'bg-[#4ECDC4] shadow-[4px_4px_0px_#000]'
                    : 'bg-white hover:bg-gray-100'
                  }
                `}
              >
                {cls}반
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{selectedClass}반 시간표</CardTitle>
                  <div className="neo-badge bg-[#FFE135] px-3 py-1 rounded-full">
                    주 {getTotalHours()}시간
                  </div>
                  {hasChanges && (
                    <span className="neo-badge bg-orange-400 px-2 py-1 rounded-full text-sm">
                      수정됨
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditMode ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        className="bg-green-400 hover:bg-green-500"
                      >
                        {isSaving ? '저장 중...' : '💾 저장'}
                      </Button>
                      <Button onClick={handleCancel} variant="secondary">
                        취소
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditMode(true)} className="bg-[#A6FAFF]">
                      ✏️ 편집
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditMode && (
                <div className="mb-4 p-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
                  <p className="text-sm font-semibold">
                    💡 빈 시간에 드롭다운으로 전담교사를 선택하세요. 기존 수업도 변경할 수 있습니다.
                  </p>
                </div>
              )}
              <EditableClassScheduleTable
                className={selectedClass}
                schedule={schedule}
                isEditMode={isEditMode}
                onCellChange={handleCellChange}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>📊 과목별 시수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(subjectHours).map(([subject, hours]) => (
                  <div key={subject} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded ${SUBJECT_BG_COLORS[subject]} border-2 border-black`}></span>
                      <span className="font-bold">{subject}</span>
                    </div>
                    <span className="neo-badge bg-gray-100 px-2 py-1 rounded font-bold">
                      {hours}시간
                    </span>
                  </div>
                ))}
                {Object.keys(subjectHours).length === 0 && (
                  <p className="text-gray-500 text-center py-4">전담 수업이 없습니다</p>
                )}
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
