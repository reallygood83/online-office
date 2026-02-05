'use client';

import { DAY_LABELS, DayOfWeek } from '@/types';
import { SUBJECT_BG_COLORS, TEACHER_INFO, TEACHERS, ALL_SUBJECTS, ALL_CLASSES } from '@/data/scheduleData';
import { useTeacherNames } from '@/lib/hooks/useTeacherNames';

import { TeacherScheduleCell } from '@/data/scheduleData';

interface TeacherScheduleTableProps {
  teacherId: string;
  schedule: { [day in DayOfWeek]: TeacherScheduleCell[] };
}

export function TeacherScheduleTable({ teacherId, schedule }: TeacherScheduleTableProps) {
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const periods = [1, 2, 3, 4, 5, 6];
  const teacherInfo = TEACHER_INFO[teacherId];
  // Default bg color from main subject
  const defaultBgColor = teacherInfo ? SUBJECT_BG_COLORS[teacherInfo.subject] : 'bg-gray-200';
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
                
                // Handle both string (legacy) and object (new) formats
                let className = '';
                let subject = teacherInfo?.subject || '';
                
                if (typeof cell === 'string') {
                  className = cell;
                } else if (cell && typeof cell === 'object') {
                  className = cell.className;
                  subject = cell.subject;
                }

                // Dynamic background based on cell subject
                const bgColor = cell ? SUBJECT_BG_COLORS[subject] || defaultBgColor : 'bg-gray-50';

                return (
                  <td
                    key={day}
                    className={`text-center font-semibold transition-all ${
                      cell ? `${bgColor} hover:opacity-80` : 'bg-gray-50'
                    }`}
                  >
                    {cell ? (
                      <div>
                        <div>{formatClassWithHomeTeacher(className)}</div>
                        {typeof cell === 'object' && cell.subject !== teacherInfo?.subject && (
                          <div className="text-xs text-gray-700 font-normal">({cell.subject})</div>
                        )}
                      </div>
                    ) : '-'}
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
  const periods = [1, 2, 3, 4, 5, 6];
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
  const periods = [1, 2, 3, 4, 5, 6];
  const { formatTeacherWithSubject, teacherRealNames } = useTeacherNames();

  const teacherOptions = TEACHERS.flatMap((t) => {
    const realName = teacherRealNames[t];
    const info = TEACHER_INFO[t];
    
    // Main subject option
    const label = realName 
      ? `${realName}(${info.subject})`
      : `${info.subject} (${t})`;
      
    const options = [{
      value: `teacher:${t}:${info.subject}`,
      label,
      subject: info.subject,
      type: 'teacher' as const,
    }];

    // Additional subjects options
    if (info.additionalSubjects) {
      info.additionalSubjects.forEach(subj => {
        options.push({
          value: `teacher:${t}:${subj}`,
          label: realName 
            ? `${realName}(${subj})` 
            : `${subj} (${t})`,
          subject: subj,
          type: 'teacher' as const,
        });
      });
    }
    
    return options;
  });

  const subjectOnlyOptions = ALL_SUBJECTS
    .filter(s => !['영어', '체육', '음악', '도덕'].includes(s))
    .map(s => ({
      value: `subject:${s}`,
      label: s,
      subject: s,
      type: 'subject' as const,
    }));

  const handleSelectChange = (day: DayOfWeek, periodIdx: number, value: string) => {
    if (value === '') {
      onCellChange(day, periodIdx, null);
      return;
    }

    if (value === 'custom:input') {
      const input = window.prompt('수업 내용이나 과목을 입력하세요:');
      if (input && input.trim()) {
        onCellChange(day, periodIdx, {
          subject: input.trim(),
          teacher: '',
        });
      }
      return;
    }

    const parts = value.split(':');
    const type = parts[0];
    
    if (type === 'teacher') {
      const [, id, subj] = parts;
      // Use parsed subject if available, otherwise fallback to main subject
      const subject = subj || TEACHER_INFO[id].subject;
      onCellChange(day, periodIdx, {
        subject: subject,
        teacher: id,
      });
    } else if (type === 'subject') {
      const [, id] = parts;
      onCellChange(day, periodIdx, {
        subject: id,
        teacher: '',
      });
    }
  };

  const getCellValue = (cell: { subject: string; teacher: string } | null): string => {
    if (!cell) return '';
    if (cell.teacher) return `teacher:${cell.teacher}:${cell.subject}`;
    
    // Check if it's a standard subject option
    const isStandardSubject = subjectOnlyOptions.some(opt => opt.value === `subject:${cell.subject}`);
    if (isStandardSubject) return `subject:${cell.subject}`;
    
    // Otherwise it's a custom value
    return `custom:${cell.subject}`;
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
                        
                        {/* Show custom value if it exists and isn't a standard option */}
                        {cell && !cell.teacher && !subjectOnlyOptions.some(o => o.subject === cell.subject) && (
                          <option value={`custom:${cell.subject}`}>
                            ✏️ {cell.subject}
                          </option>
                        )}

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
                        <option value="custom:input">✏️ 직접 입력...</option>
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

interface EditableTeacherScheduleTableProps {
  teacherId: string;
  schedule: { [day in DayOfWeek]: TeacherScheduleCell[] };
  isEditMode: boolean;
  onCellChange: (day: DayOfWeek, period: number, value: TeacherScheduleCell) => void;
}

export function EditableTeacherScheduleTable({
  teacherId,
  schedule,
  isEditMode,
  onCellChange,
}: EditableTeacherScheduleTableProps) {
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const periods = [1, 2, 3, 4, 5, 6];
  const teacherInfo = TEACHER_INFO[teacherId];
  // Default main subject
  const mainSubject = teacherInfo?.subject || '';
  const additionalSubjects = teacherInfo?.additionalSubjects || [];
  const hasMultipleSubjects = additionalSubjects.length > 0;
  
  // Available subjects for dropdown
  const availableSubjects = [mainSubject, ...additionalSubjects];

  const defaultBgColor = teacherInfo ? SUBJECT_BG_COLORS[mainSubject] : 'bg-gray-200';
  const { formatClassWithHomeTeacher } = useTeacherNames();

  const handleCellChange = (
    day: DayOfWeek, 
    periodIdx: number, 
    field: 'className' | 'subject', 
    newValue: string
  ) => {
    const currentCell = schedule[day][periodIdx];
    
    // Convert current cell to object format if needed
    let currentObject: { subject: string; className: string } | null = null;
    
    if (typeof currentCell === 'string') {
      currentObject = { subject: mainSubject, className: currentCell };
    } else if (currentCell && typeof currentCell === 'object') {
      currentObject = currentCell;
    } else {
      // If null, start with empty class but default subject
      currentObject = { subject: mainSubject, className: '' };
    }

    if (field === 'className') {
      // If clearing class name, set cell to null
      if (newValue === '') {
        onCellChange(day, periodIdx, null);
        return;
      }
      currentObject.className = newValue;
    } else if (field === 'subject') {
      currentObject.subject = newValue;
    }

    // Save as object if subject differs from main, or always save as object for consistency
    // To maintain backward compatibility where possible but support features:
    // We will save as object if hasMultipleSubjects is true to be safe, 
    // or if we simply want to migrate to new format.
    // Let's use object format for all non-null values in this new editor.
    if (currentObject.className) {
      onCellChange(day, periodIdx, currentObject);
    } else {
      onCellChange(day, periodIdx, null);
    }
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
                
                // Parse cell data
                let className = '';
                let subject = mainSubject;
                
                if (typeof cell === 'string') {
                  className = cell;
                } else if (cell && typeof cell === 'object') {
                  className = cell.className;
                  subject = cell.subject;
                }

                const bgColor = cell ? SUBJECT_BG_COLORS[subject] || defaultBgColor : 'bg-yellow-50';

                if (isEditMode) {
                  return (
                    <td key={day} className={`p-1 ${bgColor}`}>
                      <div className="flex flex-col gap-1">
                        {/* Subject Selector (Only if teacher has multiple subjects) */}
                        {hasMultipleSubjects && (
                          <select
                            className="w-full px-1 py-1 border border-black rounded text-xs font-bold bg-white/90 focus:outline-none"
                            value={subject}
                            onChange={(e) => handleCellChange(day, idx, 'subject', e.target.value)}
                          >
                            {availableSubjects.map((subj) => (
                              <option key={subj} value={subj}>
                                {subj}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {/* Class Selector */}
                        <select
                          className="w-full px-2 py-1.5 border-2 border-black rounded font-semibold text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          value={className}
                          onChange={(e) => handleCellChange(day, idx, 'className', e.target.value)}
                        >
                          <option value="">선택...</option>
                          {ALL_CLASSES.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  );
                }

                return (
                  <td
                    key={day}
                    className={`text-center font-semibold transition-all ${
                      cell ? `${bgColor} hover:opacity-80` : 'bg-gray-50'
                    }`}
                  >
                    {cell ? (
                      <div>
                        {formatClassWithHomeTeacher(className)}
                        {typeof cell === 'object' && cell.subject !== mainSubject && (
                          <div className="text-xs text-gray-700 font-normal mt-0.5">({cell.subject})</div>
                        )}
                      </div>
                    ) : '-'}
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
