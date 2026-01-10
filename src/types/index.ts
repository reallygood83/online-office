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

// ============================================
// 특별실 예약 시스템 타입
// ============================================

// 특별실 타입
export interface SpecialRoom {
  id: string;                    // auto-generated
  name: string;                  // "과학실", "컴퓨터실1" 등
  description?: string;          // 설명 (선택)
  color: string;                 // 색상 클래스 (bg-blue-300 등)
  order: number;                 // 표시 순서
  createdAt: Timestamp;
}

// 특별실 예약 타입
export interface RoomReservation {
  id: string;                    // auto-generated
  roomId: string;                // 특별실 ID
  weekStart: string;             // 주 시작일 YYYY-MM-DD (월요일)
  day: DayOfWeek;                // 요일
  period: ReservationPeriod;     // 교시 (1-6)
  reservedBy: string;            // 예약자 uid
  reserverName: string;          // 예약자 이름
  className?: string;            // 수업 학급 (선택)
  purpose?: string;              // 사용 목적 (선택)
  createdAt: Timestamp;
}

// 예약용 교시 타입 (1~6)
export type ReservationPeriod = 1 | 2 | 3 | 4 | 5 | 6;

// 특별실 기본 색상 옵션
export const ROOM_COLORS = [
  'bg-blue-300',
  'bg-green-300',
  'bg-yellow-300',
  'bg-pink-300',
  'bg-purple-300',
  'bg-orange-300',
  'bg-cyan-300',
  'bg-red-300',
] as const;

// ============================================
// 학사일정 (캘린더) 타입
// ============================================

// 학사일정 이벤트 타입
export interface SchoolEvent {
  id: string;                    // auto-generated
  title: string;                 // 일정 제목
  date: string;                  // YYYY-MM-DD
  endDate?: string;              // 종료일 (여러 날일 경우)
  category: EventCategory;       // 분류
  description?: string;          // 상세 설명
  isHoliday: boolean;            // 휴일 여부
  createdBy: string;             // 작성자 uid
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// 일정 분류
export type EventCategory = 
  | 'academic'      // 학사일정 (입학식, 졸업식 등)
  | 'exam'          // 시험/평가
  | 'event'         // 행사 (운동회, 학예회 등)
  | 'meeting'       // 회의/연수
  | 'holiday'       // 공휴일/방학
  | 'other';        // 기타

// 일정 분류 라벨
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  academic: '학사일정',
  exam: '시험/평가',
  event: '학교행사',
  meeting: '회의/연수',
  holiday: '공휴일/방학',
  other: '기타',
};

// 일정 분류별 색상
export const EVENT_CATEGORY_COLORS: Record<EventCategory, string> = {
  academic: 'bg-blue-300',
  exam: 'bg-red-300',
  event: 'bg-green-300',
  meeting: 'bg-yellow-300',
  holiday: 'bg-purple-300',
  other: 'bg-gray-300',
};

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: 'normal' | 'important' | 'urgent';
  sendEmail: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export type AnnouncementCategory = 
  | 'general'
  | 'schedule'
  | 'reservation'
  | 'event'
  | 'system';

export const ANNOUNCEMENT_CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  general: '일반 공지',
  schedule: '시간표 관련',
  reservation: '특별실 예약',
  event: '학교 행사',
  system: '시스템 안내',
};

export const ANNOUNCEMENT_PRIORITY_LABELS: Record<string, string> = {
  normal: '일반',
  important: '중요',
  urgent: '긴급',
};

export const ANNOUNCEMENT_PRIORITY_COLORS: Record<string, string> = {
  normal: 'bg-gray-200',
  important: 'bg-yellow-300',
  urgent: 'bg-red-400 text-white',
};

export interface UserNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Timestamp;
  relatedId?: string;
}

export type NotificationType = 
  | 'announcement'
  | 'reservation_made'
  | 'reservation_cancelled'
  | 'calendar_event'
  | 'system';
