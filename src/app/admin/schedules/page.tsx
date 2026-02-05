'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Timetable, 
  Day, 
  Period, 
  Schedule,
  ConflictMap,
  SPECIAL_TEACHERS,
  SUBJECT_COLORS,
  getTeacherTargetClasses,
  getTeacherSubject,
  createEmptyTimetable,
  DEFAULT_SCHEDULES,
} from '@/types';
import { detectConflicts, hasConflicts, getConflictCount } from '@/services/conflictDetector';
import { getSchedules } from '@/lib/firebase/firestore';
import ScheduleGrid from '@/components/admin/ScheduleGrid';
import TeacherSelector from '@/components/admin/TeacherSelector';
import ConflictPanel from '@/components/admin/ConflictPanel';

type LoadingState = 'idle' | 'loading' | 'saving' | 'error';

export default function SchedulesPage() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(SPECIAL_TEACHERS[0].id);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [currentTimetable, setCurrentTimetable] = useState<Timetable>(createEmptyTimetable());
  const [conflictMap, setConflictMap] = useState<ConflictMap>({});
  const [conflictCounts, setConflictCounts] = useState<{ [teacherId: string]: number }>({});
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalTimetable, setOriginalTimetable] = useState<Timetable | null>(null);

  const loadSchedules = useCallback(async () => {
    setLoadingState('loading');
    try {
      const schedules = await getSchedules('all', 'teacher');
      setAllSchedules(schedules);
      
      const counts: { [teacherId: string]: number } = {};
      for (const teacher of SPECIAL_TEACHERS) {
        const teacherSchedule = schedules.find(s => s.targetId === teacher.id);
        if (teacherSchedule) {
          const teacherConflicts = detectConflicts(schedules, teacher.id, teacherSchedule.timetable);
          counts[teacher.id] = getConflictCount(teacherConflicts);
        }
      }
      setConflictCounts(counts);
      
      setLoadingState('idle');
    } catch (error) {
      console.error('Failed to load schedules:', error);
      setLoadingState('error');
    }
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    const existingSchedule = allSchedules.find(s => s.targetId === selectedTeacherId);
    
    if (existingSchedule) {
      setCurrentTimetable(existingSchedule.timetable);
      setOriginalTimetable(existingSchedule.timetable);
    } else if (DEFAULT_SCHEDULES[selectedTeacherId]) {
      setCurrentTimetable(DEFAULT_SCHEDULES[selectedTeacherId]);
      setOriginalTimetable(DEFAULT_SCHEDULES[selectedTeacherId]);
    } else {
      const empty = createEmptyTimetable();
      setCurrentTimetable(empty);
      setOriginalTimetable(empty);
    }
    
    setHasUnsavedChanges(false);
  }, [selectedTeacherId, allSchedules]);

  useEffect(() => {
    const conflicts = detectConflicts(allSchedules, selectedTeacherId, currentTimetable);
    setConflictMap(conflicts);
  }, [currentTimetable, allSchedules, selectedTeacherId]);

  const handleCellChange = (day: Day, period: Period, className: string | null) => {
    const subject = getTeacherSubject(selectedTeacherId);
    
    setCurrentTimetable(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: className 
          ? { subject, className, teacherId: selectedTeacherId }
          : null,
      },
    }));
    
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (hasConflicts(conflictMap)) {
      const confirmed = window.confirm(
        `${getConflictCount(conflictMap)}개의 충돌이 있습니다. 그래도 저장하시겠습니까?`
      );
      if (!confirmed) return;
    }
    
    setLoadingState('saving');
    
    try {
      const { saveTeacherSchedule } = await import('@/services/scheduleService');
      await saveTeacherSchedule(
        selectedTeacherId,
        currentTimetable,
        1,
        new Date().getFullYear(),
        'admin'
      );
      
      setOriginalTimetable(currentTimetable);
      setHasUnsavedChanges(false);
      
      await loadSchedules();
      
      setLoadingState('idle');
    } catch (error) {
      console.error('Failed to save schedule:', error);
      setLoadingState('error');
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleReset = () => {
    if (originalTimetable) {
      setCurrentTimetable(originalTimetable);
      setHasUnsavedChanges(false);
    }
  };

  const handleTeacherSelect = (teacherId: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('저장하지 않은 변경사항이 있습니다. 다른 교사로 전환하시겠습니까?');
      if (!confirmed) return;
    }
    setSelectedTeacherId(teacherId);
  };

  const selectedTeacher = SPECIAL_TEACHERS.find(t => t.id === selectedTeacherId);
  const targetClasses = getTeacherTargetClasses(selectedTeacherId);
  const subject = getTeacherSubject(selectedTeacherId);
  const bgColor = SUBJECT_COLORS[subject] || 'bg-gray-200';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">시간표 편집</h1>
          <p className="text-gray-600 mt-1">전담교사 시간표를 수정하고 충돌을 확인합니다</p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="px-3 py-1 bg-neo-orange-300 border-2 border-black rounded-lg text-sm font-bold">
              변경사항 있음
            </span>
          )}
          
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasUnsavedChanges || loadingState === 'saving'}
            className={`
              px-4 py-2 font-bold border-3 border-black rounded-lg
              transition-all duration-150
              ${hasUnsavedChanges 
                ? 'bg-gray-200 shadow-neo hover:shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5' 
                : 'bg-gray-100 opacity-50 cursor-not-allowed'
              }
            `}
          >
            되돌리기
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || loadingState === 'saving'}
            className={`
              px-6 py-2 font-bold border-3 border-black rounded-lg
              transition-all duration-150 flex items-center gap-2
              ${hasUnsavedChanges 
                ? 'bg-neo-cyan-300 shadow-neo hover:shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5' 
                : 'bg-gray-100 opacity-50 cursor-not-allowed'
              }
            `}
          >
            {loadingState === 'saving' ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                저장 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                저장
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border-4 border-black rounded-xl shadow-neo-md p-4 sticky top-24">
            <TeacherSelector
              selectedTeacherId={selectedTeacherId}
              onSelect={handleTeacherSelect}
              conflictCounts={conflictCounts}
            />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border-4 border-black rounded-xl shadow-neo-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 ${bgColor} border-3 border-black rounded-lg font-black text-lg shadow-neo-sm`}>
                  {selectedTeacherId}
                </div>
                <div className="text-gray-600">
                  <span className="font-bold">{subject}</span> 전담
                  {selectedTeacher && (
                    <span className="ml-2 text-sm">
                      (주 {selectedTeacher.weeklyHours}시간)
                    </span>
                  )}
                </div>
              </div>
              
              {hasConflicts(conflictMap) && (
                <div className="px-3 py-1 bg-red-500 text-white font-bold text-sm rounded-full flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {getConflictCount(conflictMap)}개 충돌
                </div>
              )}
            </div>

            {loadingState === 'loading' ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <svg className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="font-bold text-gray-500">시간표 로딩 중...</p>
                </div>
              </div>
            ) : (
              <ScheduleGrid
                timetable={currentTimetable}
                subject={subject}
                targetClasses={targetClasses}
                conflictMap={conflictMap}
                onCellChange={handleCellChange}
                disabled={loadingState === 'saving'}
              />
            )}
          </div>

          <ConflictPanel conflictMap={conflictMap} />
        </div>
      </div>
    </div>
  );
}
