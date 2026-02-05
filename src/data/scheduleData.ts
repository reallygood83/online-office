import { DayOfWeek } from '@/types';

export type TeacherScheduleData = {
  [day in DayOfWeek]: (string | null)[];
};

export type ClassScheduleData = {
  [day in DayOfWeek]: ({ subject: string; teacher: string } | null)[];
};

export const TEACHER_SCHEDULES_SEMESTER1: Record<string, TeacherScheduleData> = {
  '영어1': {
    mon: ['5-1', '5-2', '5-3', '5-6', null],
    tue: ['5-4', '5-5', '5-6', '3-6', null],
    wed: ['5-1', '5-2', '5-3', '5-4', null],
    thu: ['5-4', '5-5', '5-6', '3-6', null],
    fri: ['5-1', '5-2', '5-3', '5-5', null],
  },
  '영전강': {
    mon: ['6-2', '6-1', '6-3', '6-4', null],
    tue: ['6-4', '6-5', '4-6', '6-6', null],
    wed: ['6-1', '6-2', '6-3', '6-6', null],
    thu: ['6-4', '6-5', '4-6', '6-5', null],
    fri: ['6-1', '6-2', '6-3', '6-6', null],
  },
  '영어2': {
    mon: ['3-1', '3-2', '3-3', '3-5', null],
    tue: ['4-1', '4-2', '4-3', '4-5', null],
    wed: ['3-4', '3-5', '4-4', '4-5', null],
    thu: ['4-1', '4-2', '4-3', '4-4', null],
    fri: ['3-1', '3-2', '3-3', '3-4', null],
  },
  '체육1': {
    mon: ['1-1', '3-1', '3-4', null, null],
    tue: ['1-2', '3-2', '3-5', '5-6', null],
    wed: ['1-3', '3-3', '3-6', null, null],
    thu: ['1-4', '3-1', '3-4', '5-6', null],
    fri: ['3-2', '3-3', '3-5', '3-6', null],
  },
  '체육2': {
    mon: ['4-1', '4-2', '4-3', '5-1', null],
    tue: ['4-4', '4-5', '5-4', '5-2', null],
    wed: ['4-1', '4-2', '4-3', '5-1', '4-6'],
    thu: ['4-4', '4-5', '5-2', '5-3', '5-5'],
    fri: ['4-6', '5-3', '5-4', null, '5-5'],
  },
  '체육3': {
    mon: ['6-1', '6-6', '6-5', '6-2', null],
    tue: ['2-1', '6-3', '6-1', '6-2', '6-4'],
    wed: ['2-2', '6-6', '6-5', '6-4', null],
    thu: ['2-3', '6-3', '6-1', '6-2', null],
    fri: ['2-4', '6-4', '6-6', '6-3', '6-5'],
  },
  '음악': {
    mon: ['5-4', '5-5', '5-6', '6-1', null],
    tue: ['6-3', '6-6', '5-1', '5-3', null],
    wed: ['5-4', '5-5', '5-6', null, null],
    thu: ['5-3', '6-4', '5-1', '5-2', null],
    fri: ['6-2', null, '6-5', '5-2', null],
  },
  '도덕1': {
    mon: [null, '1-2', '1-3', '1-4', null],
    tue: ['3-1', null, '3-3', '5-1', '5-2'],
    wed: [null, '3-4', '3-6', '3-5', null],
    thu: ['5-3', '5-4', '5-5', '3-2', null],
    fri: ['5-6', '1-1', null, null, null],
  },
  '도덕2': {
    mon: ['2-1', '2-2', '2-3', '2-4', null],
    tue: ['6-1', '6-2', '6-3', null, null],
    wed: ['6-4', '6-5', '6-6', null, null],
    thu: [null, '4-1', '4-2', '4-3', null],
    fri: ['4-4', '4-5', '4-6', null, null],
  },
};

export const TEACHER_SCHEDULES_SEMESTER2: Record<string, TeacherScheduleData> = {
  '영어1': {
    mon: ['5-1', '5-2', '5-3', '5-6', null],
    tue: ['5-4', '5-5', '5-6', '3-6', null],
    wed: ['5-1', '5-2', '5-3', '5-4', null],
    thu: ['5-4', '5-5', '5-6', '3-6', null],
    fri: ['5-1', '5-2', '5-3', '5-5', null],
  },
  '영전강': {
    mon: ['6-1', '6-2', '6-3', '6-6', null],
    tue: ['6-4', '6-5', '4-6', '6-4', null],
    wed: ['6-1', '6-2', '6-3', '6-5', null],
    thu: ['6-4', '6-5', '4-6', '6-6', null],
    fri: ['6-1', '6-2', '6-3', '6-6', null],
  },
  '영어2': {
    mon: ['3-1', '3-2', '3-3', '3-5', null],
    tue: ['4-1', '4-2', '4-3', '4-5', null],
    wed: ['3-4', '3-5', '4-4', '4-5', null],
    thu: ['4-1', '4-2', '4-3', '4-4', null],
    fri: ['3-1', '3-2', '3-3', '3-4', null],
  },
  '체육1': {
    mon: ['1-1', '3-1', '3-4', null, null],
    tue: ['1-2', '3-2', '3-5', '5-6', null],
    wed: ['1-3', '3-3', '3-6', null, null],
    thu: ['1-4', '3-1', '3-4', '5-6', null],
    fri: ['3-2', '3-3', '3-5', '3-6', null],
  },
  '체육2': {
    mon: ['4-1', '4-2', '4-3', '5-1', null],
    tue: ['4-4', '4-5', '5-4', '5-2', null],
    wed: ['4-1', '4-2', '4-3', '5-1', '4-6'],
    thu: ['4-4', '4-5', '5-2', '5-3', '5-5'],
    fri: ['5-5', '5-3', '5-4', '4-6', null],
  },
  '체육3': {
    mon: [null, '6-6', '6-5', '6-2', '6-1'],
    tue: ['2-1', '6-3', '6-1', '6-2', '6-4'],
    wed: ['2-2', '6-6', '6-5', '6-4', null],
    thu: ['2-3', '6-3', '6-1', '6-2', null],
    fri: ['2-4', '6-4', '6-6', '6-3', '6-5'],
  },
  '음악': {
    mon: ['5-4', '5-5', '5-6', '6-1', null],
    tue: ['6-3', '6-6', '5-1', '5-3', null],
    wed: ['5-4', '5-5', '5-6', null, '6-4'],
    thu: ['5-2', '5-3', '5-1', null, null],
    fri: ['6-2', null, '6-5', '5-2', null],
  },
  '도덕1': {
    mon: [null, '1-2', '1-3', '1-4', null],
    tue: ['3-1', null, '3-3', '5-1', '5-2'],
    wed: [null, '3-4', '3-6', '3-5', null],
    thu: ['5-3', '5-4', '5-5', '3-2', null],
    fri: ['5-6', '1-1', null, null, null],
  },
  '도덕2': {
    mon: ['2-1', '2-2', '2-3', '2-4', null],
    tue: ['6-1', '6-2', '6-3', null, null],
    wed: ['6-4', '6-5', '6-6', null, null],
    thu: [null, '4-1', '4-2', '4-3', null],
    fri: ['4-4', '4-5', '4-6', null, null],
  },
};

export const TEACHER_INFO: Record<string, { subject: string; weeklyHours: number; targetGrades: string }> = {
  '영어1': { subject: '영어', weeklyHours: 20, targetGrades: '5학년, 3-6반' },
  '영전강': { subject: '영어', weeklyHours: 20, targetGrades: '6학년, 4-6반' },
  '영어2': { subject: '영어', weeklyHours: 20, targetGrades: '3-4학년' },
  '체육1': { subject: '체육', weeklyHours: 18, targetGrades: '1학년, 3학년, 5-6반' },
  '체육2': { subject: '체육', weeklyHours: 22, targetGrades: '4-5학년' },
  '체육3': { subject: '체육', weeklyHours: 22, targetGrades: '2학년, 6학년' },
  '음악': { subject: '음악', weeklyHours: 18, targetGrades: '5-6학년' },
  '도덕1': { subject: '도덕', weeklyHours: 16, targetGrades: '1, 3, 5학년' },
  '도덕2': { subject: '도덕', weeklyHours: 16, targetGrades: '2, 4, 6학년' },
};

export const ALL_SUBJECTS = [
  '국어', '수학', '통합교과', '도덕', '사회', '과학',
  '음악', '미술', '체육', '실과', '영어', '창체'
] as const;

export const SPECIALIST_SUBJECTS = ['영어', '체육', '음악', '도덕'] as const;

export const SUBJECT_BG_COLORS: Record<string, string> = {
  '국어': 'bg-blue-200',
  '수학': 'bg-red-200',
  '통합교과': 'bg-amber-200',
  '도덕': 'bg-purple-300',
  '사회': 'bg-orange-200',
  '과학': 'bg-cyan-200',
  '음악': 'bg-pink-300',
  '미술': 'bg-rose-200',
  '체육': 'bg-green-300',
  '실과': 'bg-lime-200',
  '영어': 'bg-yellow-300',
  '창체': 'bg-teal-200',
};

export const ALL_CLASSES = [
  '1-1', '1-2', '1-3', '1-4',
  '2-1', '2-2', '2-3', '2-4',
  '3-1', '3-2', '3-3', '3-4', '3-5', '3-6',
  '4-1', '4-2', '4-3', '4-4', '4-5', '4-6',
  '5-1', '5-2', '5-3', '5-4', '5-5', '5-6',
  '6-1', '6-2', '6-3', '6-4', '6-5', '6-6',
];

export const TEACHERS = ['영어1', '영전강', '영어2', '체육1', '체육2', '체육3', '음악', '도덕1', '도덕2'];

export function getClassSchedule(
  className: string,
  semester: 1 | 2
): ClassScheduleData {
  const teacherSchedules = semester === 1 ? TEACHER_SCHEDULES_SEMESTER1 : TEACHER_SCHEDULES_SEMESTER2;
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
  
  const result: ClassScheduleData = {
    mon: [null, null, null, null, null],
    tue: [null, null, null, null, null],
    wed: [null, null, null, null, null],
    thu: [null, null, null, null, null],
    fri: [null, null, null, null, null],
  };

  for (const [teacherId, schedule] of Object.entries(teacherSchedules)) {
    const teacherInfo = TEACHER_INFO[teacherId];
    
    for (const day of days) {
      for (let period = 0; period < 5; period++) {
        if (schedule[day][period] === className) {
          result[day][period] = {
            subject: teacherInfo.subject,
            teacher: teacherId,
          };
        }
      }
    }
  }

  return result;
}
