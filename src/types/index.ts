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
}

// Special Teacher Types
export interface SpecialTeacher {
  id: string;                    // "영어1", "체육2" etc.
  name: string;                  // Actual teacher name
  subject: string;               // "영어", "체육", "음악", "도덕" (주 담당 과목)
  additionalSubjects?: string[]; // 추가 담당 과목 (예: 도덕 전담이 체육도 병행)
  weeklyHours: number;           // Weekly hours
  targetClasses: string[];       // Target class list
}

// Schedule Types
export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
export type DayOfWeek = Day;
export type Period = 1 | 2 | 3 | 4 | 5 | 6;

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
  semester: 1 | 2;
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
export const PERIODS: Period[] = [1, 2, 3, 4, 5, 6];

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
  '영어1': {
    mon: { 1: { subject: '영어', className: '5-1' }, 2: { subject: '영어', className: '5-2' }, 3: { subject: '영어', className: '5-3' }, 4: { subject: '영어', className: '5-6' }, 5: null, 6: null },
    tue: { 1: { subject: '영어', className: '5-4' }, 2: { subject: '영어', className: '5-5' }, 3: { subject: '영어', className: '5-6' }, 4: { subject: '영어', className: '3-6' }, 5: null, 6: null },
    wed: { 1: { subject: '영어', className: '5-1' }, 2: { subject: '영어', className: '5-2' }, 3: { subject: '영어', className: '5-3' }, 4: { subject: '영어', className: '5-4' }, 5: null, 6: null },
    thu: { 1: { subject: '영어', className: '5-4' }, 2: { subject: '영어', className: '5-5' }, 3: { subject: '영어', className: '5-6' }, 4: { subject: '영어', className: '3-6' }, 5: null, 6: null },
    fri: { 1: { subject: '영어', className: '5-1' }, 2: { subject: '영어', className: '5-2' }, 3: { subject: '영어', className: '5-3' }, 4: { subject: '영어', className: '5-5' }, 5: null, 6: null },
  },
  '영전강': {
    mon: { 1: { subject: '영어', className: '6-2' }, 2: { subject: '영어', className: '6-1' }, 3: { subject: '영어', className: '6-3' }, 4: { subject: '영어', className: '6-4' }, 5: null, 6: null },
    tue: { 1: { subject: '영어', className: '6-4' }, 2: { subject: '영어', className: '6-5' }, 3: { subject: '영어', className: '4-6' }, 4: { subject: '영어', className: '6-6' }, 5: null, 6: null },
    wed: { 1: { subject: '영어', className: '6-1' }, 2: { subject: '영어', className: '6-2' }, 3: { subject: '영어', className: '6-3' }, 4: { subject: '영어', className: '6-6' }, 5: null, 6: null },
    thu: { 1: { subject: '영어', className: '6-4' }, 2: { subject: '영어', className: '6-5' }, 3: { subject: '영어', className: '4-6' }, 4: { subject: '영어', className: '6-5' }, 5: null, 6: null },
    fri: { 1: { subject: '영어', className: '6-1' }, 2: { subject: '영어', className: '6-2' }, 3: { subject: '영어', className: '6-3' }, 4: { subject: '영어', className: '6-6' }, 5: null, 6: null },
  },
  '영어2': {
    mon: { 1: { subject: '영어', className: '3-1' }, 2: { subject: '영어', className: '3-2' }, 3: { subject: '영어', className: '3-3' }, 4: { subject: '영어', className: '3-5' }, 5: null, 6: null },
    tue: { 1: { subject: '영어', className: '4-1' }, 2: { subject: '영어', className: '4-2' }, 3: { subject: '영어', className: '4-3' }, 4: { subject: '영어', className: '4-5' }, 5: null, 6: null },
    wed: { 1: { subject: '영어', className: '3-4' }, 2: { subject: '영어', className: '3-5' }, 3: { subject: '영어', className: '4-4' }, 4: { subject: '영어', className: '4-5' }, 5: null, 6: null },
    thu: { 1: { subject: '영어', className: '4-1' }, 2: { subject: '영어', className: '4-2' }, 3: { subject: '영어', className: '4-3' }, 4: { subject: '영어', className: '4-4' }, 5: null, 6: null },
    fri: { 1: { subject: '영어', className: '3-1' }, 2: { subject: '영어', className: '3-2' }, 3: { subject: '영어', className: '3-3' }, 4: { subject: '영어', className: '3-4' }, 5: null, 6: null },
  },
  '체육1': {
    mon: { 1: { subject: '체육', className: '1-1' }, 2: { subject: '체육', className: '3-1' }, 3: { subject: '체육', className: '3-4' }, 4: null, 5: null, 6: null },
    tue: { 1: { subject: '체육', className: '1-2' }, 2: { subject: '체육', className: '3-2' }, 3: { subject: '체육', className: '3-5' }, 4: { subject: '체육', className: '5-6' }, 5: null, 6: null },
    wed: { 1: { subject: '체육', className: '1-3' }, 2: { subject: '체육', className: '3-3' }, 3: { subject: '체육', className: '3-6' }, 4: null, 5: null, 6: null },
    thu: { 1: { subject: '체육', className: '1-4' }, 2: { subject: '체육', className: '3-1' }, 3: { subject: '체육', className: '3-4' }, 4: { subject: '체육', className: '5-6' }, 5: null, 6: null },
    fri: { 1: { subject: '체육', className: '3-2' }, 2: { subject: '체육', className: '3-3' }, 3: { subject: '체육', className: '3-5' }, 4: { subject: '체육', className: '3-6' }, 5: null, 6: null },
  },
  '체육2': {
    mon: { 1: { subject: '체육', className: '4-1' }, 2: { subject: '체육', className: '4-2' }, 3: { subject: '체육', className: '4-3' }, 4: { subject: '체육', className: '5-1' }, 5: null, 6: null },
    tue: { 1: { subject: '체육', className: '4-4' }, 2: { subject: '체육', className: '4-5' }, 3: { subject: '체육', className: '5-4' }, 4: { subject: '체육', className: '5-2' }, 5: null, 6: null },
    wed: { 1: { subject: '체육', className: '4-1' }, 2: { subject: '체육', className: '4-2' }, 3: { subject: '체육', className: '4-3' }, 4: { subject: '체육', className: '5-1' }, 5: { subject: '체육', className: '4-6' }, 6: null },
    thu: { 1: { subject: '체육', className: '4-4' }, 2: { subject: '체육', className: '4-5' }, 3: { subject: '체육', className: '5-2' }, 4: { subject: '체육', className: '5-3' }, 5: { subject: '체육', className: '5-5' }, 6: null },
    fri: { 1: { subject: '체육', className: '4-6' }, 2: { subject: '체육', className: '5-3' }, 3: { subject: '체육', className: '5-4' }, 4: null, 5: { subject: '체육', className: '5-5' }, 6: null },
  },
  '체육3': {
    mon: { 1: { subject: '체육', className: '6-1' }, 2: { subject: '체육', className: '6-6' }, 3: { subject: '체육', className: '6-5' }, 4: { subject: '체육', className: '6-2' }, 5: null, 6: null },
    tue: { 1: { subject: '체육', className: '2-1' }, 2: { subject: '체육', className: '6-3' }, 3: { subject: '체육', className: '6-1' }, 4: { subject: '체육', className: '6-2' }, 5: { subject: '체육', className: '6-4' }, 6: null },
    wed: { 1: { subject: '체육', className: '2-2' }, 2: { subject: '체육', className: '6-6' }, 3: { subject: '체육', className: '6-5' }, 4: { subject: '체육', className: '6-4' }, 5: null, 6: null },
    thu: { 1: { subject: '체육', className: '2-3' }, 2: { subject: '체육', className: '6-3' }, 3: { subject: '체육', className: '6-1' }, 4: { subject: '체육', className: '6-2' }, 5: null, 6: null },
    fri: { 1: { subject: '체육', className: '2-4' }, 2: { subject: '체육', className: '6-4' }, 3: { subject: '체육', className: '6-6' }, 4: { subject: '체육', className: '6-3' }, 5: { subject: '체육', className: '6-5' }, 6: null },
  },
  '음악': {
    mon: { 1: { subject: '음악', className: '5-4' }, 2: { subject: '음악', className: '5-5' }, 3: { subject: '음악', className: '5-6' }, 4: { subject: '음악', className: '6-1' }, 5: null, 6: null },
    tue: { 1: { subject: '음악', className: '6-3' }, 2: { subject: '음악', className: '6-6' }, 3: { subject: '음악', className: '5-1' }, 4: { subject: '음악', className: '5-3' }, 5: null, 6: null },
    wed: { 1: { subject: '음악', className: '5-4' }, 2: { subject: '음악', className: '5-5' }, 3: { subject: '음악', className: '5-6' }, 4: null, 5: null, 6: null },
    thu: { 1: { subject: '음악', className: '5-3' }, 2: { subject: '음악', className: '6-4' }, 3: { subject: '음악', className: '5-1' }, 4: { subject: '음악', className: '5-2' }, 5: null, 6: null },
    fri: { 1: { subject: '음악', className: '6-2' }, 2: null, 3: { subject: '음악', className: '6-5' }, 4: { subject: '음악', className: '5-2' }, 5: null, 6: null },
  },
  '도덕1': {
    mon: { 1: null, 2: { subject: '도덕', className: '1-2' }, 3: { subject: '도덕', className: '1-3' }, 4: { subject: '도덕', className: '1-4' }, 5: null, 6: null },
    tue: { 1: { subject: '도덕', className: '3-1' }, 2: null, 3: { subject: '도덕', className: '3-3' }, 4: { subject: '도덕', className: '5-1' }, 5: { subject: '도덕', className: '5-2' }, 6: null },
    wed: { 1: null, 2: { subject: '도덕', className: '3-4' }, 3: { subject: '도덕', className: '3-6' }, 4: { subject: '도덕', className: '3-5' }, 5: null, 6: null },
    thu: { 1: { subject: '도덕', className: '5-3' }, 2: { subject: '도덕', className: '5-4' }, 3: { subject: '도덕', className: '5-5' }, 4: { subject: '도덕', className: '3-2' }, 5: null, 6: null },
    fri: { 1: { subject: '도덕', className: '5-6' }, 2: { subject: '도덕', className: '1-1' }, 3: null, 4: null, 5: null, 6: null },
  },
  '도덕2': {
    mon: { 1: { subject: '도덕', className: '2-1' }, 2: { subject: '도덕', className: '2-2' }, 3: { subject: '도덕', className: '2-3' }, 4: { subject: '도덕', className: '2-4' }, 5: null, 6: null },
    tue: { 1: { subject: '도덕', className: '6-1' }, 2: { subject: '도덕', className: '6-2' }, 3: { subject: '도덕', className: '6-3' }, 4: null, 5: null, 6: null },
    wed: { 1: { subject: '도덕', className: '6-4' }, 2: { subject: '도덕', className: '6-5' }, 3: { subject: '도덕', className: '6-6' }, 4: null, 5: null, 6: null },
    thu: { 1: null, 2: { subject: '도덕', className: '4-1' }, 3: { subject: '도덕', className: '4-2' }, 4: { subject: '도덕', className: '4-3' }, 5: null, 6: null },
    fri: { 1: { subject: '도덕', className: '4-4' }, 2: { subject: '도덕', className: '4-5' }, 3: { subject: '도덕', className: '4-6' }, 4: null, 5: null, 6: null },
  },
};

export const getTeacherSubject = (teacherId: string): string => {
  const teacher = SPECIAL_TEACHERS.find(t => t.id === teacherId);
  return teacher?.subject || '';
};

export const createEmptyTimetable = (): Timetable => ({
  mon: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
  tue: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
  wed: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
  thu: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
  fri: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
});


// ========== ANNOUNCEMENTS ==========
// ========== ANNOUNCEMENTS ==========
export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: 'low' | 'medium' | 'high';
  authorId?: string;
  authorName?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: any;
  isPublic?: boolean;
  sendEmail?: boolean;
}

export const ANNOUNCEMENT_CATEGORY_LABELS = {
  notice: '일반 공지',
  event: '행사/일정',
  urgent: '긴급 공지',
};

export const ANNOUNCEMENT_PRIORITY_LABELS = {
  low: '보통',
  medium: '중요',
  high: '긴급',
};

export const ANNOUNCEMENT_PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-800 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
};

export type AnnouncementCategory = keyof typeof ANNOUNCEMENT_CATEGORY_LABELS;


// ========== SCHOOL EVENTS ==========
export type EventCategory = 'academic' | 'holiday' | 'special' | 'exam';

export interface SchoolEvent {
  id: string;
  title: string;
  date: any; // Timestamp or Date
  endDate?: any; // Optional end date for multi-day events
  category: EventCategory;
  description?: string;
  isHoliday?: boolean; // Whether this is a holiday
  createdBy: string;
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  academic: '학사일정',
  holiday: '공휴일/휴업일',
  special: '특별활동',
  exam: '고사/평가'
};

export const EVENT_CATEGORY_COLORS: Record<EventCategory, string> = {
  academic: 'bg-blue-50 text-blue-700 border-blue-200',
  holiday: 'bg-red-50 text-red-700 border-red-200',
  special: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  exam: 'bg-purple-50 text-purple-700 border-purple-200'
};


// ========== SPECIAL ROOMS ==========
export interface SpecialRoom {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
  description?: string;
  color?: string;
  order?: number;
}

export const ROOM_COLORS = [
  'bg-red-100', 'bg-orange-100', 'bg-amber-100',
  'bg-yellow-100', 'bg-lime-100', 'bg-green-100',
  'bg-emerald-100', 'bg-teal-100', 'bg-cyan-100',
  'bg-sky-100', 'bg-blue-100', 'bg-indigo-100',
  'bg-violet-100', 'bg-purple-100', 'bg-fuchsia-100', 'bg-pink-100', 'bg-rose-100'
];


// ========== RESERVATIONS ==========
export type ReservationPeriod = 1 | 2 | 3 | 4 | 5 | 6;

export interface RoomReservation {
  id: string;
  roomId: string;
  roomName?: string;
  weekStart: string;
  day: DayOfWeek;
  period: ReservationPeriod;
  reservedBy: string;
  reserverName: string;
  className?: string;
  purpose?: string;
  createdAt: any;
}

// ========== USER NOTIFICATIONS ==========
export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'announcement' | 'reservation_made' | 'reservation_cancelled' | 'calendar_event' | 'info';
  link?: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: any;
}

export interface TeacherInfoData {
  subject: string;
  weeklyHours: number;
  targetGrades: string;
  additionalSubjects?: string[];
}

// ========== CURRICULUM - CROSS SUBJECT ==========
export type Grade = 1 | 2 | 3 | 4 | 5 | 6;
export type Semester = 1 | 2;
export type InputType = 'gyo' | 'chang';

export interface GradeHours {
  sem1_gyo: number;
  sem1_chang: number;
  sem2_gyo: number;
  sem2_chang: number;
}

export interface SafetyEducationItem {
  id: string;
  name: string;
  hoursInfo: string;
  isRequired: boolean;
  grades: Record<Grade, GradeHours>;
}

export interface SafetyEducationSection {
  id: number;
  name: string;
  color: string;
  hoursDescription: string;
  items: SafetyEducationItem[];
}

export interface OptionalEducationItem {
  id: string;
  name: string;
  type: 'mandatory' | 'recommended';
  checked: boolean;
}

export interface CrossSubjectCurriculumData {
  year: number;
  sections: SafetyEducationSection[];
  optionalItems: OptionalEducationItem[];
  updatedAt?: any;
  updatedBy?: string;
}

export const SAFETY_EDUCATION_SECTIONS: Omit<SafetyEducationSection, 'items'>[] = [
  { id: 1, name: '생활안전', color: 'blue', hoursDescription: '12시간, 학기당 2회 이상' },
  { id: 2, name: '교통안전', color: 'green', hoursDescription: '11시간, 학기당 3회 이상' },
  { id: 3, name: '폭력예방 및 신변보호', color: 'orange', hoursDescription: '8시간, 학기당 2회 이상' },
  { id: 4, name: '약물 및 사이버 중독 예방', color: 'red', hoursDescription: '약물5+사이버5, 학기당 2회 이상' },
  { id: 5, name: '재난안전', color: 'purple', hoursDescription: '6시간, 학기당 2회 이상' },
  { id: 6, name: '직업안전', color: 'teal', hoursDescription: '2시간' },
  { id: 7, name: '응급처치', color: 'gray', hoursDescription: '2시간' },
];

export const SECTION_ITEMS_CONFIG: Record<number, { name: string; info: string; required: boolean }[]> = {
  1: [
    { name: '실종·유괴의 예방·방지 교육', info: '3개월 1회+ (연간 10시간+)', required: true },
    { name: '건강한 식생활 및 영양교육', info: '연 2회 이상', required: false },
    { name: '과학실 안전교육', info: '학교에서 정하여 반영(의무)', required: false },
    { name: '학생생존수영교육 (물놀이 안전)', info: '3학년(10차시+), 4학년(6차시+)', required: false },
    { name: '그 외 생활안전교육 (PM 포함)', info: '자전거, 전동킥보드 등 필수', required: false },
  ],
  2: [
    { name: '교통안전교육', info: '2개월 1회+ (연간 10시간+) ★11시간', required: true },
  ],
  3: [
    { name: '학교폭력예방교육', info: '연 2회 11시간 *사이버폭력 3차시+', required: false },
    { name: '가정폭력예방교육', info: '매년 1회 1시간 이상', required: false },
    { name: '성폭력 예방교육', info: '6개월 1회+ (연간 4시간+)', required: true },
    { name: '아동학대 예방교육', info: '6개월 1회+ (연간 4시간+)', required: true },
    { name: '생명존중 및 자살예방교육', info: '(교육부) 연간 6시간+ 의무', required: false },
  ],
  4: [
    { name: '인터넷·스마트폰과의존예방', info: '학기별 1회+ *사이버중독 5시간', required: false },
    { name: '감염병 및 약물 오용·남용 예방', info: '3개월 1회+ (연간 10시간+)', required: true },
  ],
  5: [
    { name: '재난대비안전교육', info: '6개월 1회+ (연간 6시간+) *비상훈련2종+', required: true },
  ],
  6: [
    { name: '직업안전교육', info: '학기당 1회 이상', required: false },
  ],
  7: [
    { name: '응급처치교육', info: '학기당 1회 이상', required: false },
  ],
};

export const OPTIONAL_EDUCATION_ITEMS: Omit<OptionalEducationItem, 'checked'>[] = [
  { id: 'play', name: '놀이 활동 활성화', type: 'mandatory' },
  { id: 'population', name: '인구교육', type: 'mandatory' },
  { id: 'culture', name: '문화예술교육', type: 'recommended' },
  { id: 'democracy', name: '민주시민교육 *선거교육', type: 'recommended' },
  { id: 'economy', name: '경제·금융 교육 *학교급별 1개 학년', type: 'recommended' },
  { id: 'invention', name: '발명교육', type: 'recommended' },
  { id: 'maker', name: '메이커교육', type: 'recommended' },
  { id: 'korean', name: '올바른 국어 사용 교육', type: 'recommended' },
  { id: 'family', name: '다양한 가족 형태에 대한 사회적 인식 개선 교육', type: 'recommended' },
  { id: 'steam', name: 'STEAM교육', type: 'recommended' },
];

export const SECTION_COLORS: Record<string, string> = {
  blue: 'bg-[#3498db]',
  green: 'bg-[#27ae60]',
  orange: 'bg-[#e67e22]',
  red: 'bg-[#e74c3c]',
  purple: 'bg-[#9b59b6]',
  teal: 'bg-[#1abc9c]',
  gray: 'bg-[#7f8c8d]',
  pink: 'bg-[#e91e63]',
};

export interface CurriculumScheduleItem {
  id: string;
  month: number;
  startDate: string;
  endDate?: string;
  activityName: string;
  gradeHours: {
    grade1: number | null;
    grade2: number | null;
    grade3: number | null;
    grade4: number | null;
    grade5: number | null;
    grade6: number | null;
  };
  subject: string;
  notes?: string;
  linkedEventId?: string;
  year: number;
  createdAt?: any;
  updatedAt?: any;
  updatedBy?: string;
}

export const MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2] as const;

export const MONTH_LABELS: Record<number, string> = {
  1: '1월', 2: '2월', 3: '3월', 4: '4월', 5: '5월', 6: '6월',
  7: '7월', 8: '8월', 9: '9월', 10: '10월', 11: '11월', 12: '12월',
};
