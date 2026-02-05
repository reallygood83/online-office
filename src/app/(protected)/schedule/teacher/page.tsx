'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Select } from '@/components/ui';
import { TeacherScheduleTable, EditableTeacherScheduleTable } from '@/components/schedule/ScheduleTable';
import { SemesterSelector } from '@/components/schedule/SemesterSelector';
import { useTeacherNames } from '@/lib/hooks/useTeacherNames';
import { useAuth } from '@/lib/hooks/useAuth';
import { DayOfWeek, DEFAULT_SCHEDULES } from '@/types';
import {
  TEACHERS,
  TEACHER_INFO,
  TEACHER_SCHEDULES_SEMESTER1,
  TEACHER_SCHEDULES_SEMESTER2,
  SUBJECT_BG_COLORS,
  TeacherScheduleData,
} from '@/data/scheduleData';

export default function TeacherSchedulePage() {
  const [semester, setSemester] = useState<1 | 2>(1);
  const [selectedTeacher, setSelectedTeacher] = useState<string>(TEACHERS[0]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedSchedules, setEditedSchedules] = useState<Record<string, TeacherScheduleData>>({});
  const { teacherRealNames, formatTeacherWithSubject } = useTeacherNames();
  const { user } = useAuth();

  const baseScheduleData = semester === 1 ? TEACHER_SCHEDULES_SEMESTER1 : TEACHER_SCHEDULES_SEMESTER2;
  const scheduleData = { ...baseScheduleData, ...editedSchedules };
  const teacherInfo = TEACHER_INFO[selectedTeacher];

  useEffect(() => {
    setEditedSchedules({});
  }, [semester]);

  const getTeacherDisplayName = (teacherId: string) => {
    const realName = teacherRealNames[teacherId];
    const info = TEACHER_INFO[teacherId];
    return realName ? `${realName}(${info.subject})` : teacherId;
  };

  const teacherOptions = TEACHERS.map((t) => ({
    value: t,
    label: getTeacherDisplayName(t),
  }));

  const handleCellChange = (day: DayOfWeek, periodIdx: number, value: string | null) => {
    setEditedSchedules((prev) => {
      const currentSchedule = prev[selectedTeacher] || { ...baseScheduleData[selectedTeacher] };
      const newDaySchedule = [...currentSchedule[day]];
      newDaySchedule[periodIdx] = value;
      return {
        ...prev,
        [selectedTeacher]: {
          ...currentSchedule,
          [day]: newDaySchedule,
        },
      };
    });
  };

  const handleSave = async () => {
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditedSchedules({});
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">👨‍🏫 전담교사 시간표</h1>
          <p className="text-gray-600 mt-1">전담교사별 주간 수업 시간표를 확인하세요</p>
        </div>
        <SemesterSelector semester={semester} onSemesterChange={setSemester} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>전담교사 선택</CardTitle>
            <div className="w-full md:w-64">
              <Select
                options={teacherOptions}
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {TEACHERS.map((teacher) => {
              const info = TEACHER_INFO[teacher];
              const bgColor = SUBJECT_BG_COLORS[info.subject];
              return (
                <button
                  key={teacher}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`
                    neo-button px-3 py-1.5 rounded-lg text-sm font-bold
                    ${selectedTeacher === teacher
                      ? `${bgColor} shadow-[4px_4px_0px_#000]`
                      : 'bg-white hover:bg-gray-100'
                    }
                  `}
                >
                  {getTeacherDisplayName(teacher)}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className={`neo-badge ${SUBJECT_BG_COLORS[teacherInfo.subject]} px-3 py-1 rounded-full text-lg`}>
                {teacherInfo.subject}
              </span>
              <div>
                <CardTitle>{getTeacherDisplayName(selectedTeacher)}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  주 {teacherInfo.weeklyHours}시간 | 담당: {teacherInfo.targetGrades}
                </p>
              </div>
            </div>
            {user?.isAdmin && (
              <div className="flex gap-2">
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="neo-button px-4 py-2 bg-gray-200 border-2 border-black rounded-lg font-bold shadow-neo-sm hover:shadow-neo-pressed hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      className="neo-button px-4 py-2 bg-neo-lime-300 border-2 border-black rounded-lg font-bold shadow-neo-sm hover:shadow-neo-pressed hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                    >
                      저장
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="neo-button px-4 py-2 bg-neo-yellow-300 border-2 border-black rounded-lg font-bold shadow-neo-sm hover:shadow-neo-pressed hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    편집
                  </button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditMode ? (
            <EditableTeacherScheduleTable
              teacherId={selectedTeacher}
              schedule={scheduleData[selectedTeacher]}
              isEditMode={isEditMode}
              onCellChange={handleCellChange}
            />
          ) : (
            <TeacherScheduleTable
              teacherId={selectedTeacher}
              schedule={scheduleData[selectedTeacher]}
            />
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>📊 전담교사 시수 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEACHERS.map((teacher) => {
              const info = TEACHER_INFO[teacher];
              const bgColor = SUBJECT_BG_COLORS[info.subject];
              const realName = teacherRealNames[teacher];
              return (
                <div
                  key={teacher}
                  className={`neo-card ${bgColor} p-4 rounded-xl cursor-pointer transition-transform hover:translate-y-[-2px]`}
                  onClick={() => setSelectedTeacher(teacher)}
                >
                  <div className="font-extrabold text-lg">
                    {realName ? `${realName}(${info.subject})` : teacher}
                  </div>
                  <div className="text-sm opacity-80">{info.subject}</div>
                  <div className="font-bold text-2xl mt-2">{info.weeklyHours}시간</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
