// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'teacher';
  isAdmin: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

// Class Types
export interface Class {
  id: string;                    // "1-1", "3-6" etc.
  grade: number;                 // 1~6
  classNumber: number;           // 1~6
  homeTeacherName: string;       // Homeroom teacher name
  homeTeacherId?: string;        // Homeroom teacher user uid (optional)
  semester1Hours: number;        // 1st semester total hours
  semester2Hours: number;        // 2nd semester total hours
}

// Special Teacher Types
export interface SpecialTeacher {
  id: string;                    // "영어1", "체육2" etc.
  name: string;                  // Actual teacher name
  subject: string;               // "영어", "체육", "음악", "도덕"
  weeklyHours: number;           // Weekly hours
  targetClasses: string[];       // Target class list
}

// Schedule Types
export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
export type Period = 1 | 2 | 3 | 4 | 5;

export interface ScheduleCell {
  subject: string;
  teacherId?: string;
  className?: string;
}

export interface Timetable {
  mon: { [period: number]: ScheduleCell | null };
  tue: { [period: number]: ScheduleCell | null };
  wed: { [period: number]: ScheduleCell | null };
  thu: { [period: number]: ScheduleCell | null };
  fri: { [period: number]: ScheduleCell | null };
}

export interface Schedule {
  id: string;
  semester: 1 | 2 | 'year';
  year: number;
  type: 'teacher' | 'class';
  targetId: string;              // Teacher ID or Class ID
  timetable: Timetable;
  updatedAt: Date;
  updatedBy: string;             // User uid
}

// Settings Types
export interface Settings {
  specialCode: string;
  currentSemester: 1 | 2;
  currentYear: number;
  admins: string[];              // Admin user uids (multiple allowed)
}

// Day Labels (Korean)
export const DAY_LABELS: { [key in Day]: string } = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
};

export const DAYS: Day[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
export const PERIODS: Period[] = [1, 2, 3, 4, 5];

// Grade/Class Configuration
export const GRADE_CLASS_CONFIG = {
  1: 4,  // 1st grade: 4 classes
  2: 4,  // 2nd grade: 4 classes
  3: 6,  // 3rd grade: 6 classes
  4: 6,  // 4th grade: 6 classes
  5: 6,  // 5th grade: 6 classes
  6: 6,  // 6th grade: 6 classes
} as const;

// Subject Colors (Neo-Brutalism)
export const SUBJECT_COLORS: { [key: string]: string } = {
  '영어': 'bg-yellow-300',
  '체육': 'bg-green-300',
  '음악': 'bg-pink-300',
  '도덕': 'bg-blue-300',
};

// Teacher Configuration
export const SPECIAL_TEACHERS = [
  { id: '영어1', subject: '영어', weeklyHours: 20, targetGrades: [1, 2, 3, 4, 5, 6] },
  { id: '영전강', subject: '영어', weeklyHours: 20, targetGrades: [1, 2, 3, 4, 5, 6] },
  { id: '영어2', subject: '영어', weeklyHours: 20, targetGrades: [1, 2, 3, 4, 5, 6] },
  { id: '체육1', subject: '체육', weeklyHours: 18, targetGrades: [1, 2, 3, 4, 5, 6] },
  { id: '체육2', subject: '체육', weeklyHours: 22, targetGrades: [1, 2, 3, 4, 5, 6] },
  { id: '체육3', subject: '체육', weeklyHours: 22, targetGrades: [1, 2, 3, 4, 5, 6] },
  { id: '음악', subject: '음악', weeklyHours: 18, targetGrades: [1, 2, 3, 4, 5, 6] },
  { id: '도덕1', subject: '도덕', weeklyHours: 16, targetGrades: [1, 3, 5] },
  { id: '도덕2', subject: '도덕', weeklyHours: 16, targetGrades: [2, 4, 6] },
] as const;

// Generate class IDs for given grades (e.g., [1, 3, 5] → ["1-1", "1-2", ..., "5-6"])
export const getClassesByGrades = (grades: readonly number[]): string[] => {
  const classes: string[] = [];
  for (const grade of grades) {
    const classCount = GRADE_CLASS_CONFIG[grade as keyof typeof GRADE_CLASS_CONFIG];
    for (let i = 1; i <= classCount; i++) {
      classes.push(`${grade}-${i}`);
    }
  }
  return classes;
};

// Get target classes for a specific teacher
export const getTeacherTargetClasses = (teacherId: string): string[] => {
  const teacher = SPECIAL_TEACHERS.find(t => t.id === teacherId);
  if (!teacher) return [];
  return getClassesByGrades(teacher.targetGrades);
};

export const YEAR_ROUND_TEACHER_IDS = ['도덕1', '도덕2'] as const;

export const isYearRoundTeacher = (teacherId: string): boolean => {
  return YEAR_ROUND_TEACHER_IDS.includes(teacherId as typeof YEAR_ROUND_TEACHER_IDS[number]);
};

export const getTeacherSemesterType = (teacherId: string): 'year' | null => {
  return isYearRoundTeacher(teacherId) ? 'year' : null;
};

export interface Conflict {
  type: 'class' | 'teacher';
  severity: 'error' | 'warning';
  day: Day;
  period: number;
  message: string;
  affectedEntities: string[];
}

export interface ConflictMap {
  [timeSlot: string]: Conflict[];
}

export const DEFAULT_SCHEDULES: { [teacherId: string]: Timetable } = {
  '도덕1': {
    mon: { 1: null, 2: { subject: '도덕', className: '1-2' }, 3: { subject: '도덕', className: '1-3' }, 4: { subject: '도덕', className: '1-4' }, 5: null },
    tue: { 1: { subject: '도덕', className: '3-1' }, 2: null, 3: { subject: '도덕', className: '3-3' }, 4: { subject: '도덕', className: '5-1' }, 5: { subject: '도덕', className: '5-2' } },
    wed: { 1: null, 2: { subject: '도덕', className: '3-4' }, 3: { subject: '도덕', className: '3-6' }, 4: { subject: '도덕', className: '3-5' }, 5: null },
    thu: { 1: { subject: '도덕', className: '5-3' }, 2: { subject: '도덕', className: '5-4' }, 3: { subject: '도덕', className: '5-5' }, 4: { subject: '도덕', className: '3-2' }, 5: null },
    fri: { 1: { subject: '도덕', className: '5-6' }, 2: { subject: '도덕', className: '1-1' }, 3: null, 4: null, 5: null },
  },
  '도덕2': {
    mon: { 1: { subject: '도덕', className: '2-1' }, 2: { subject: '도덕', className: '2-2' }, 3: { subject: '도덕', className: '2-3' }, 4: { subject: '도덕', className: '2-4' }, 5: null },
    tue: { 1: { subject: '도덕', className: '6-1' }, 2: { subject: '도덕', className: '6-2' }, 3: { subject: '도덕', className: '6-3' }, 4: null, 5: null },
    wed: { 1: { subject: '도덕', className: '6-4' }, 2: { subject: '도덕', className: '6-5' }, 3: { subject: '도덕', className: '6-6' }, 4: null, 5: null },
    thu: { 1: null, 2: { subject: '도덕', className: '4-1' }, 3: { subject: '도덕', className: '4-2' }, 4: { subject: '도덕', className: '4-3' }, 5: null },
    fri: { 1: { subject: '도덕', className: '4-4' }, 2: { subject: '도덕', className: '4-5' }, 3: { subject: '도덕', className: '4-6' }, 4: null, 5: null },
  },
};

export const getTeacherSubject = (teacherId: string): string => {
  const teacher = SPECIAL_TEACHERS.find(t => t.id === teacherId);
  return teacher?.subject || '';
};

export const createEmptyTimetable = (): Timetable => ({
  mon: { 1: null, 2: null, 3: null, 4: null, 5: null },
  tue: { 1: null, 2: null, 3: null, 4: null, 5: null },
  wed: { 1: null, 2: null, 3: null, 4: null, 5: null },
  thu: { 1: null, 2: null, 3: null, 4: null, 5: null },
  fri: { 1: null, 2: null, 3: null, 4: null, 5: null },
});
