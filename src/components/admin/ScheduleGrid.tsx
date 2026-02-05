'use client';

import { 
  Timetable, 
  Day, 
  Period, 
  DAYS, 
  PERIODS, 
  DAY_LABELS, 
  SUBJECT_COLORS,
  ScheduleCell,
  ConflictMap,
} from '@/types';
import ClassDropdown from './ClassDropdown';

interface ScheduleGridProps {
  timetable: Timetable;
  subject: string;
  targetClasses: string[];
  conflictMap: ConflictMap;
  onCellChange: (day: Day, period: Period, className: string | null) => void;
  disabled?: boolean;
  additionalSubjects?: string[];
}

const PERIOD_LABELS = ['1교시', '2교시', '3교시', '4교시', '5교시'];

export default function ScheduleGrid({
  timetable,
  subject,
  targetClasses,
  conflictMap,
  onCellChange,
  disabled = false,
  additionalSubjects = [],
}: ScheduleGridProps) {
  const getConflictKey = (day: Day, period: Period) => `${day}-${period}`;
  
  const hasConflictAt = (day: Day, period: Period): boolean => {
    const key = getConflictKey(day, period);
    return Boolean(conflictMap[key]?.length);
  };

  const handleCellChange = (day: Day, period: Period, className: string | null) => {
    onCellChange(day, period, className);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-20 p-2 bg-gray-100 border-3 border-black font-black text-center">
              시간
            </th>
            {DAYS.map((day) => (
              <th 
                key={day} 
                className="min-w-[90px] p-2 bg-neo-yellow-300 border-3 border-black font-black text-center text-lg"
              >
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period, idx) => (
            <tr key={period}>
              <td className="p-2 bg-gray-100 border-3 border-black font-bold text-center">
                {PERIOD_LABELS[idx]}
              </td>
              {DAYS.map((day) => {
                const cell = timetable[day][period];
                const hasConflict = hasConflictAt(day, period);
                
                return (
                  <td 
                    key={`${day}-${period}`} 
                    className={`
                      p-2 border-3 border-black 
                      ${hasConflict ? 'bg-red-100' : 'bg-white'}
                    `}
                  >
                    <ClassDropdown
                      value={cell?.className || null}
                      options={targetClasses}
                      subject={subject}
                      hasConflict={hasConflict}
                      onChange={(className) => handleCellChange(day, period, className)}
                      disabled={disabled}
                      additionalSubjects={additionalSubjects}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
