'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ALL_CLASSES, getClassSchedule, SUBJECT_BG_COLORS } from '@/data/scheduleData';

export default function ClassesPage() {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [semester] = useState<1 | 2>(1);

  const gradeClasses: Record<number, string[]> = {
    1: ALL_CLASSES.filter((c) => c.startsWith('1-')),
    2: ALL_CLASSES.filter((c) => c.startsWith('2-')),
    3: ALL_CLASSES.filter((c) => c.startsWith('3-')),
    4: ALL_CLASSES.filter((c) => c.startsWith('4-')),
    5: ALL_CLASSES.filter((c) => c.startsWith('5-')),
    6: ALL_CLASSES.filter((c) => c.startsWith('6-')),
  };

  const getClassHours = (className: string) => {
    const schedule = getClassSchedule(className, semester);
    let total = 0;
    const days = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;
    days.forEach((day) => {
      schedule[day].forEach((cell) => {
        if (cell) total++;
      });
    });
    return total;
  };

  const getSubjectBreakdown = (className: string) => {
    const schedule = getClassSchedule(className, semester);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">📚 학급/담임 관리</h1>
        <p className="text-gray-600 mt-1">학급별 담임교사 및 전담 시수를 확인하세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>학년 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`
                  neo-button px-4 py-2 rounded-lg font-bold
                  ${selectedGrade === grade
                    ? 'bg-[#FFE135] shadow-[4px_4px_0px_#000]'
                    : 'bg-white hover:bg-gray-100'
                  }
                `}
              >
                {grade}학년 ({gradeClasses[grade].length}반)
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gradeClasses[selectedGrade].map((className) => {
          const hours = getClassHours(className);
          const breakdown = getSubjectBreakdown(className);
          
          return (
            <Card key={className}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl">{className}반</span>
                  <span className="neo-badge bg-[#FFE135] px-3 py-1 rounded-full text-sm">
                    전담 {hours}시간
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-sm font-medium text-gray-500">담임교사</div>
                    <div className="text-gray-400 italic mt-1">
                      (관리자 페이지에서 설정)
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-bold mb-2">전담 수업 현황</div>
                    <div className="space-y-2">
                      {Object.entries(breakdown).map(([subject, subjectHours]) => (
                        <div key={subject} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded ${SUBJECT_BG_COLORS[subject]} border-2 border-black`}></span>
                            <span className="font-medium">{subject}</span>
                          </div>
                          <span className="font-bold">{subjectHours}시간</span>
                        </div>
                      ))}
                      {Object.keys(breakdown).length === 0 && (
                        <p className="text-gray-400 text-sm">전담 수업 없음</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>📊 학년별 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="neo-table w-full">
              <thead>
                <tr>
                  <th>학년</th>
                  <th>학급 수</th>
                  <th>학급당 전담시수</th>
                  <th>학년 총 시수</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((grade) => {
                  const classes = gradeClasses[grade];
                  const avgHours = getClassHours(classes[0]);
                  const totalHours = avgHours * classes.length;
                  return (
                    <tr key={grade}>
                      <td className="text-center font-bold">{grade}학년</td>
                      <td className="text-center">{classes.length}반</td>
                      <td className="text-center">{avgHours}시간</td>
                      <td className="text-center font-bold">{totalHours}시간</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
