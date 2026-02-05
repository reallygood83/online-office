'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Select } from '@/components/ui';
import { TeacherScheduleTable } from '@/components/schedule/ScheduleTable';
import { SemesterSelector } from '@/components/schedule/SemesterSelector';
import { useTeacherNames } from '@/lib/hooks/useTeacherNames';
import {
  TEACHERS,
  TEACHER_INFO,
  TEACHER_SCHEDULES_SEMESTER1,
  TEACHER_SCHEDULES_SEMESTER2,
  SUBJECT_BG_COLORS,
} from '@/data/scheduleData';

export default function TeacherSchedulePage() {
  const [semester, setSemester] = useState<1 | 2>(1);
  const [selectedTeacher, setSelectedTeacher] = useState<string>(TEACHERS[0]);
  const { teacherRealNames, formatTeacherWithSubject } = useTeacherNames();

  const scheduleData = semester === 1 ? TEACHER_SCHEDULES_SEMESTER1 : TEACHER_SCHEDULES_SEMESTER2;
  const teacherInfo = TEACHER_INFO[selectedTeacher];

  const getTeacherDisplayName = (teacherId: string) => {
    const realName = teacherRealNames[teacherId];
    const info = TEACHER_INFO[teacherId];
    return realName ? `${realName}(${info.subject})` : teacherId;
  };

  const teacherOptions = TEACHERS.map((t) => ({
    value: t,
    label: getTeacherDisplayName(t),
  }));

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
        </CardHeader>
        <CardContent>
          <TeacherScheduleTable
            teacherId={selectedTeacher}
            schedule={scheduleData[selectedTeacher]}
          />
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
