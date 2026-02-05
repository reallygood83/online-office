import type { Schedule, Timetable, Day, Conflict, ConflictMap } from '@/types';
import { DAYS, PERIODS } from '@/types';

interface Assignment {
  teacherId: string;
  className: string;
  subject: string;
}

interface TimeSlotIndex {
  [timeSlot: string]: Assignment[];
}

export function detectConflicts(
  allSchedules: Schedule[],
  currentTeacherId?: string,
  proposedTimetable?: Timetable
): ConflictMap {
  let schedules = [...allSchedules];

  if (currentTeacherId && proposedTimetable) {
    schedules = schedules.filter(s => s.targetId !== currentTeacherId);
    schedules.push({
      id: `temp-${currentTeacherId}`,
      type: 'teacher',
      targetId: currentTeacherId,
      semester: 'year',
      year: new Date().getFullYear(),
      timetable: proposedTimetable,
      updatedAt: new Date(),
      updatedBy: 'temp',
    });
  }

  return buildConflictMap(schedules);
}

function buildConflictMap(schedules: Schedule[]): ConflictMap {
  const conflicts: ConflictMap = {};
  const timeSlotIndex = buildTimeSlotIndex(schedules);

  for (const [timeSlot, assignments] of Object.entries(timeSlotIndex)) {
    const [day, periodStr] = timeSlot.split('-');
    const period = parseInt(periodStr, 10);

    const classConflicts = detectClassConflicts(assignments, day as Day, period);
    const teacherConflicts = detectTeacherConflicts(assignments, day as Day, period);

    const allConflicts = [...classConflicts, ...teacherConflicts];

    if (allConflicts.length > 0) {
      conflicts[timeSlot] = allConflicts;
    }
  }

  return conflicts;
}

function buildTimeSlotIndex(schedules: Schedule[]): TimeSlotIndex {
  const index: TimeSlotIndex = {};

  for (const schedule of schedules) {
    if (schedule.type !== 'teacher') continue;

    const teacherId = schedule.targetId;

    for (const day of DAYS) {
      const daySchedule = schedule.timetable[day];

      for (const period of PERIODS) {
        const cell = daySchedule[period];
        if (!cell || !cell.className) continue;

        const timeSlot = `${day}-${period}`;
        if (!index[timeSlot]) {
          index[timeSlot] = [];
        }

        index[timeSlot].push({
          teacherId,
          className: cell.className,
          subject: cell.subject,
        });
      }
    }
  }

  return index;
}

function detectClassConflicts(assignments: Assignment[], day: Day, period: number): Conflict[] {
  const conflicts: Conflict[] = [];

  const byClass = new Map<string, Assignment[]>();
  for (const assignment of assignments) {
    if (!byClass.has(assignment.className)) {
      byClass.set(assignment.className, []);
    }
    byClass.get(assignment.className)!.push(assignment);
  }

  for (const [className, classAssignments] of byClass.entries()) {
    if (classAssignments.length > 1) {
      const teachers = classAssignments.map(a => `${a.teacherId}(${a.subject})`);
      conflicts.push({
        type: 'class',
        severity: 'error',
        day,
        period,
        message: `${className} 학급에 ${teachers.join(', ')} 수업이 겹칩니다`,
        affectedEntities: classAssignments.map(a => a.teacherId),
      });
    }
  }

  return conflicts;
}

function detectTeacherConflicts(assignments: Assignment[], day: Day, period: number): Conflict[] {
  const conflicts: Conflict[] = [];

  const byTeacher = new Map<string, Assignment[]>();
  for (const assignment of assignments) {
    if (!byTeacher.has(assignment.teacherId)) {
      byTeacher.set(assignment.teacherId, []);
    }
    byTeacher.get(assignment.teacherId)!.push(assignment);
  }

  for (const [teacherId, teacherAssignments] of byTeacher.entries()) {
    if (teacherAssignments.length > 1) {
      const classes = teacherAssignments.map(a => a.className);
      conflicts.push({
        type: 'teacher',
        severity: 'error',
        day,
        period,
        message: `${teacherId} 선생님이 ${classes.join(', ')} 학급에 동시 배정됨`,
        affectedEntities: classes,
      });
    }
  }

  return conflicts;
}

export function hasConflicts(conflictMap: ConflictMap): boolean {
  return Object.keys(conflictMap).length > 0;
}

export function getConflictCount(conflictMap: ConflictMap): number {
  return Object.values(conflictMap).reduce((sum, conflicts) => sum + conflicts.length, 0);
}
