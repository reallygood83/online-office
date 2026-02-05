'use client';

import { ConflictMap, Conflict, DAY_LABELS, Day } from '@/types';

interface ConflictPanelProps {
  conflictMap: ConflictMap;
  title?: string;
}

export default function ConflictPanel({ 
  conflictMap,
  title = '충돌 감지',
}: ConflictPanelProps) {
  const allConflicts: (Conflict & { timeSlot: string })[] = [];
  
  for (const [timeSlot, conflicts] of Object.entries(conflictMap)) {
    for (const conflict of conflicts) {
      allConflicts.push({ ...conflict, timeSlot });
    }
  }
  
  const hasConflicts = allConflicts.length > 0;
  
  const classConflicts = allConflicts.filter(c => c.type === 'class');
  const teacherConflicts = allConflicts.filter(c => c.type === 'teacher');

  const formatTimeSlot = (day: Day, period: number) => {
    return `${DAY_LABELS[day]} ${period}교시`;
  };

  if (!hasConflicts) {
    return (
      <div className="p-4 bg-neo-lime-200 border-3 border-black rounded-xl shadow-neo-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border-3 border-black rounded-lg flex items-center justify-center shadow-neo-sm">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-black">충돌 없음</h3>
            <p className="text-sm text-gray-600">모든 시간표가 정상입니다</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black flex items-center gap-2">
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {title}
        </h3>
        <span className="px-3 py-1 bg-red-500 text-white font-bold text-sm rounded-full">
          {allConflicts.length}개 충돌
        </span>
      </div>

      {classConflicts.length > 0 && (
        <div className="p-4 bg-neo-red-200 border-3 border-black rounded-xl shadow-neo-sm">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              A
            </span>
            학급 충돌 (한 학급에 여러 수업)
          </h4>
          <ul className="space-y-2">
            {classConflicts.map((conflict, idx) => (
              <li 
                key={`class-${idx}`}
                className="p-3 bg-white border-2 border-black rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-bold rounded">
                    {formatTimeSlot(conflict.day, conflict.period)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium">{conflict.message}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {conflict.affectedEntities.map((entity) => (
                    <span 
                      key={entity}
                      className="px-2 py-0.5 bg-red-100 border border-red-300 rounded text-xs font-medium"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {teacherConflicts.length > 0 && (
        <div className="p-4 bg-neo-orange-200 border-3 border-black rounded-xl shadow-neo-sm">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              B
            </span>
            교사 충돌 (한 교사가 여러 학급에 동시 배정)
          </h4>
          <ul className="space-y-2">
            {teacherConflicts.map((conflict, idx) => (
              <li 
                key={`teacher-${idx}`}
                className="p-3 bg-white border-2 border-black rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-bold rounded">
                    {formatTimeSlot(conflict.day, conflict.period)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium">{conflict.message}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {conflict.affectedEntities.map((entity) => (
                    <span 
                      key={entity}
                      className="px-2 py-0.5 bg-orange-100 border border-orange-300 rounded text-xs font-medium"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
