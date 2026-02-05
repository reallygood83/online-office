'use client';

import { SPECIAL_TEACHERS, SUBJECT_COLORS, getTeacherTargetClasses } from '@/types';

interface TeacherSelectorProps {
  selectedTeacherId: string;
  onSelect: (teacherId: string) => void;
  conflictCounts?: { [teacherId: string]: number };
}

const subjectGroups = [
  { subject: '영어', color: 'bg-yellow-300' },
  { subject: '체육', color: 'bg-green-300' },
  { subject: '음악', color: 'bg-pink-300' },
  { subject: '도덕', color: 'bg-blue-300' },
];

export default function TeacherSelector({
  selectedTeacherId,
  onSelect,
  conflictCounts = {},
}: TeacherSelectorProps) {
  const getTeachersBySubject = (subject: string) => {
    return SPECIAL_TEACHERS.filter((t) => t.subject === subject);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black">전담교사 선택</h3>
      
      <div className="space-y-3">
        {subjectGroups.map((group) => (
          <div key={group.subject}>
            <div className={`inline-block px-3 py-1 ${group.color} border-2 border-black rounded-lg font-bold text-sm mb-2`}>
              {group.subject}
            </div>
            <div className="flex flex-wrap gap-2">
              {getTeachersBySubject(group.subject).map((teacher) => {
                const isSelected = selectedTeacherId === teacher.id;
                const conflictCount = conflictCounts[teacher.id] || 0;
                const targetClasses = getTeacherTargetClasses(teacher.id);
                
                return (
                  <button
                    key={teacher.id}
                    type="button"
                    onClick={() => onSelect(teacher.id)}
                    className={`
                      relative px-4 py-2 font-bold border-3 border-black rounded-lg
                      transition-all duration-150
                      ${isSelected 
                        ? `${group.color} shadow-neo-pressed translate-x-0.5 translate-y-0.5` 
                        : 'bg-white shadow-neo hover:shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span>{teacher.id}</span>
                      {conflictCount > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {conflictCount}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="text-xs text-gray-700 mt-1">
                        주 {teacher.weeklyHours}시간 · {targetClasses.length}학급
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedTeacherId && (
        <div className="mt-4 p-4 bg-white border-3 border-black rounded-lg shadow-neo-sm">
          <h4 className="font-bold text-sm text-gray-600 mb-2">선택된 교사 정보</h4>
          {(() => {
            const teacher = SPECIAL_TEACHERS.find(t => t.id === selectedTeacherId);
            if (!teacher) return null;
            
            const targetClasses = getTeacherTargetClasses(teacher.id);
            const bgColor = SUBJECT_COLORS[teacher.subject] || 'bg-gray-200';
            
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 ${bgColor} border-2 border-black rounded-lg font-bold`}>
                    {teacher.id}
                  </div>
                  <span className="font-medium text-gray-600">{teacher.subject} 전담</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="px-3 py-2 bg-gray-100 border-2 border-black rounded-lg">
                    <span className="font-bold">주당 수업:</span> {teacher.weeklyHours}시간
                  </div>
                  <div className="px-3 py-2 bg-gray-100 border-2 border-black rounded-lg">
                    <span className="font-bold">담당 학년:</span> {teacher.targetGrades.join(', ')}학년
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  담당 학급: {targetClasses.slice(0, 8).join(', ')}{targetClasses.length > 8 ? ` 외 ${targetClasses.length - 8}개` : ''}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
