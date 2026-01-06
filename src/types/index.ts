import { Timestamp } from 'firebase/firestore';

// 사용자 타입
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'teacher';
  isAdmin: boolean;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// 학급 타입
export interface Class {
  id: string;                    // "1-1", "3-6" 등
  grade: number;                 // 1~6
  classNumber: number;           // 1~6
  homeTeacherName: string;       // 담임 이름
  homeTeacherId?: string;        // 담임 user uid (선택)
  semester1Hours: number;        // 1학기 전담시수
  semester2Hours: number;        // 2학기 전담시수
}

// 전담교사 타입
export interface SpecialTeacher {
  id: string;                    // "영어1", "체육2" 등
  name: string;                  // 실제 교사명
  subject: string;               // "영어", "체육", "음악", "도덕"
  weeklyHours: number;           // 주간 시수
  targetClasses: string[];       // 담당 학급 목록
}

// 시간표 셀 타입
export interface ScheduleCell {
  subject: string;
  teacherId?: string;
  className?: string;
}

// 요일 타입
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

// 교시 타입 (1~5)
export type Period = 1 | 2 | 3 | 4 | 5;

// 시간표 타입
export interface Schedule {
  id: string;                    // auto-generated
  semester: 1 | 2;               // 학기
  year: number;                  // 2026
  type: 'teacher' | 'class';     // 전담교사별 / 학급별
  targetId: string;              // 교사ID 또는 학급ID
  timetable: {
    [day in DayOfWeek]?: {
      [period in Period]?: ScheduleCell | null;
    };
  };
  updatedAt: Timestamp;
  updatedBy: string;             // user uid
}

// 설정 타입
export interface Settings {
  id: 'main';
  specialCode: string;           // "20261234"
  currentSemester: 1 | 2;
  currentYear: number;
  admins: string[];              // admin user uids (복수 가능)
}

// 학년별 학급 수
export const GRADE_CLASS_COUNT: Record<number, number> = {
  1: 4,
  2: 4,
  3: 6,
  4: 6,
  5: 6,
  6: 6,
};

// 요일 라벨
export const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
};

// 전담교사 목록
export const SPECIAL_TEACHERS = [
  { id: '영어1', subject: '영어', weeklyHours: 20 },
  { id: '영전강', subject: '영어', weeklyHours: 20 },
  { id: '영어2', subject: '영어', weeklyHours: 20 },
  { id: '체육1', subject: '체육', weeklyHours: 18 },
  { id: '체육2', subject: '체육', weeklyHours: 22 },
  { id: '체육3', subject: '체육', weeklyHours: 22 },
  { id: '음악', subject: '음악', weeklyHours: 18 },
  { id: '도덕', subject: '도덕', weeklyHours: 16 },
] as const;

// 과목별 색상 (Neo-Brutalism 스타일)
export const SUBJECT_COLORS: Record<string, string> = {
  '영어': 'bg-yellow-300',
  '체육': 'bg-green-300',
  '음악': 'bg-pink-300',
  '도덕': 'bg-purple-300',
  '-': 'bg-gray-100',
};
