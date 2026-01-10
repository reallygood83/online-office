'use client';

import { DAY_LABELS, DayOfWeek } from '@/types';
import { SUBJECT_BG_COLORS, TEACHER_INFO, TEACHERS, ALL_SUBJECTS } from '@/data/scheduleData';
import { useTeacherNames } from '@/lib/hooks/useTeacherNames';

interface TeacherScheduleTableProps {
  teacherId: string;
  schedule: { [day in DayOfWeek]: (string | null)[] };
}

export function TeacherScheduleTable({ teacherId, schedule }: TeacherScheduleTableProps) {
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const periods = [1, 2, 3, 4, 5];
  const teacherInfo = TEACHER_INFO[teacherId];
  const bgColor = teacherInfo ? SUBJECT_BG_COLORS[teacherInfo.subject] : 'bg-gray-200';
  const { formatClassWithHomeTeacher } = useTeacherNames();

  return (
    <div className="overflow-x-auto">
      <table className="neo-table w-full min-w-[500px]">
        <thead>
          <tr>
            <th className="w-16">교시</th>
            {days.map((day) => (
              <th key={day} className="w-32">{DAY_LABELS[day]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period, idx) => (
            <tr key={period}>
              <td className="text-center font-bold bg-gray-100">{period}</td>
              {days.map((day) => {
                const cell = schedule[day][idx];
                return (
                  <td
                    key={day}
                    className={`text-center font-semibold transition-all ${
                      cell ? `${bgColor} hover:opacity-80` : 'bg-gray-50'
                    }`}
                  >
                    {cell ? formatClassWithHomeTeacher(cell) : '-'}
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

interface ClassScheduleTableProps {
  className: string;
  schedule: { [day in DayOfWeek]: ({ subject: string; teacher: string } | null)[] };
}

export function ClassScheduleTable({ className, schedule }: ClassScheduleTableProps) {
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const periods = [1, 2, 3, 4, 5];
  const { formatTeacherWithSubject } = useTeacherNames();

  return (
    <div className="overflow-x-auto">
      <table className="neo-table w-full min-w-[500px]">
        <thead>
          <tr>
            <th className="w-16">교시</th>
            {days.map((day) => (
              <th key={day} className="w-32">{DAY_LABELS[day]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period, idx) => (
            <tr key={period}>
              <td className="text-center font-bold bg-gray-100">{period}</td>
              {days.map((day) => {
                const cell = schedule[day][idx];
                const bgColor = cell ? SUBJECT_BG_COLORS[cell.subject] : '';
                return (
                  <td
                    key={day}
                    className={`text-center transition-all ${
                      cell ? `${bgColor} hover:opacity-80` : 'bg-gray-50'
                    }`}
                  >
                    {cell ? (
                      <div>
                        <div className="font-bold">{cell.subject}</div>
                        <div className="text-xs text-gray-600">
                          ({formatTeacherWithSubject(cell.teacher, cell.subject)})
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
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

interface EditableClassScheduleTableProps {
  className: string;
  schedule: { [day in DayOfWeek]: ({ subject: string; teacher: string } | null)[] };
  isEditMode: boolean;
  onCellChange: (day: DayOfWeek, period: number, value: { subject: string; teacher: string } | null) => void;
}

export function EditableClassScheduleTable({
  className,
  schedule,
  isEditMode,
  onCellChange,
}: EditableClassScheduleTableProps) {
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const periods = [1, 2, 3, 4, 5];
  const { formatTeacherWithSubject, teacherRealNames } = useTeacherNames();

  const teacherOptions = TEACHERS.map((t) => {
    const realName = teacherRealNames[t];
    const info = TEACHER_INFO[t];
    const label = realName 
      ? `${realName}(${info.subject})`
      : `${info.subject} (${t})`;
    return {
      value: `teacher:${t}`,
      label,
      subject: info.subject,
      type: 'teacher' as const,
    };
  });

  const subjectOnlyOptions = ALL_SUBJECTS
    .filter(s => !['영어', '체육', '음악', '도덕'].includes(s))
    .map(s => ({
      value: `subject:${s}`,
      label: s,
      subject: s,
      type: 'subject' as const,
    }));

  const allOptions = [...teacherOptions, ...subjectOnlyOptions];

  const handleSelectChange = (day: DayOfWeek, periodIdx: number, value: string) => {
    if (value === '') {
      onCellChange(day, periodIdx, null);
      return;
    }

    const [type, id] = value.split(':');
    
    if (type === 'teacher') {
      const info = TEACHER_INFO[id];
      onCellChange(day, periodIdx, {
        subject: info.subject,
        teacher: id,
      });
    } else if (type === 'subject') {
      onCellChange(day, periodIdx, {
        subject: id,
        teacher: '',
      });
    }
  };

  const getCellValue = (cell: { subject: string; teacher: string } | null): string => {
    if (!cell) return '';
    if (cell.teacher) return `teacher:${cell.teacher}`;
    return `subject:${cell.subject}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="neo-table w-full min-w-[500px]">
        <thead>
          <tr>
            <th className="w-16">교시</th>
            {days.map((day) => (
              <th key={day} className="w-36">{DAY_LABELS[day]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period, idx) => (
            <tr key={period}>
              <td className="text-center font-bold bg-gray-100">{period}</td>
              {days.map((day) => {
                const cell = schedule[day][idx];
                const bgColor = cell ? (SUBJECT_BG_COLORS[cell.subject] || 'bg-gray-200') : '';

                if (isEditMode) {
                  return (
                    <td key={day} className={`p-1 ${cell ? bgColor : 'bg-yellow-50'}`}>
                      <select
                        className="w-full px-2 py-1.5 border-2 border-black rounded font-semibold text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        value={getCellValue(cell)}
                        onChange={(e) => handleSelectChange(day, idx, e.target.value)}
                      >
                        <option value="">선택...</option>
                        <optgroup label="📚 전담교사 수업">
                          {teacherOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="📖 담임 수업">
                          {subjectOnlyOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </td>
                  );
                }

                return (
                  <td
                    key={day}
                    className={`text-center transition-all ${
                      cell ? `${bgColor} hover:opacity-80` : 'bg-gray-50'
                    }`}
                  >
                    {cell ? (
                      <div>
                        <div className="font-bold">{cell.subject}</div>
                        {cell.teacher && (
                          <div className="text-xs text-gray-600">
                            ({formatTeacherWithSubject(cell.teacher, cell.subject)})
                          </div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
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
