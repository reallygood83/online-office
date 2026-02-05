import type { Schedule, Timetable, ScheduleCell, Day } from '@/types';
import { DAYS, PERIODS, SPECIAL_TEACHERS } from '@/types';
import { getSchedules, createSchedule, updateSchedule } from '@/lib/firebase/firestore';

export async function getClassSchedule(
  className: string,
  semester: 1 | 2,
  year: number
): Promise<Timetable> {
  const teacherSchedules = await getSchedules(semester, 'teacher');
  return buildClassTimetable(className, teacherSchedules);
}

function buildClassTimetable(className: string, teacherSchedules: Schedule[]): Timetable {
  const timetable: Timetable = {
    mon: { 1: null, 2: null, 3: null, 4: null, 5: null },
    tue: { 1: null, 2: null, 3: null, 4: null, 5: null },
    wed: { 1: null, 2: null, 3: null, 4: null, 5: null },
    thu: { 1: null, 2: null, 3: null, 4: null, 5: null },
    fri: { 1: null, 2: null, 3: null, 4: null, 5: null },
  };

  for (const teacherSchedule of teacherSchedules) {
    const teacherId = teacherSchedule.targetId;

    for (const day of DAYS) {
      const daySchedule = teacherSchedule.timetable[day];

      for (const period of PERIODS) {
        const cell = daySchedule[period];

        if (cell?.className === className) {
          timetable[day][period] = {
            subject: cell.subject,
            teacherId: teacherId,
          };
        }
      }
    }
  }

  return timetable;
}

export async function getAllClassSchedules(
  semester: 1 | 2,
  year: number
): Promise<Map<string, Timetable>> {
  const teacherSchedules = await getSchedules(semester, 'teacher');
  const classSchedules = new Map<string, Timetable>();

  const allClasses = new Set<string>();
  for (const schedule of teacherSchedules) {
    for (const day of DAYS) {
      const daySchedule = schedule.timetable[day];
      for (const period of PERIODS) {
        const cell = daySchedule[period];
        if (cell?.className) {
          allClasses.add(cell.className);
        }
      }
    }
  }

  for (const className of allClasses) {
    classSchedules.set(className, buildClassTimetable(className, teacherSchedules));
  }

  return classSchedules;
}

export async function saveTeacherSchedule(
  teacherId: string,
  timetable: Timetable,
  semester: 1 | 2,
  year: number,
  userId: string
): Promise<string> {
  const schedules = await getSchedules('all', 'teacher');
  const existing = schedules.find(
    s => s.targetId === teacherId && s.semester === semester && s.year === year
  );

  if (existing) {
    await updateSchedule(existing.id, timetable, userId);
    return existing.id;
  }

  return await createSchedule({
    type: 'teacher',
    targetId: teacherId,
    semester,
    year,
    timetable,
    updatedBy: userId,
  });
}

export function getTeacherInfo(teacherId: string) {
  return SPECIAL_TEACHERS.find(t => t.id === teacherId);
}

export function getAllTeacherIds(): string[] {
  return SPECIAL_TEACHERS.map(t => t.id);
}

export function getTeachersBySubject(subject: string) {
  return SPECIAL_TEACHERS.filter(t => t.subject === subject);
}
