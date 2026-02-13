import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { addSchoolEvent, updateSchoolEvent, deleteSchoolEvent, getSchoolEvents } from './firestore';

export interface AcademicEvent {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  time?: string;
  notes: string;
  linkedEventId?: string;
}

export interface SchoolDays {
  semester1: {
    march: number;
    april: number;
    may: number;
    june: number;
    july: number;
    total: number;
    discretionaryDays: number;
  };
  semester2: {
    august: number;
    september: number;
    october: number;
    november: number;
    december: number;
    january: number;
    february: number;
    total: number;
    discretionaryDays: number;
  };
  totalSchoolDays: number;
}

export interface TimetableSlot {
  period: string;
  time: string;
  notes?: string;
}

export interface TimetableData {
  arrivalTime: string;
  arrivalNote: string;
  lowerGrades: TimetableSlot[];
  upperGrades: TimetableSlot[];
  lunchLower: { time: string; schedule: string[] };
  lunchUpper: { time: string; schedule: string[] };
}

export interface WeeklyHoursRow {
  grade: string;
  mon: number | string;
  tue: number | string;
  wed: number | string;
  thu: number | string;
  fri: number | string;
}

export interface WeeklyHoursData {
  rows: WeeklyHoursRow[];
  homeStudyDays: number;
}

export interface AnnualCalendarData {
  year: number;
  events: AcademicEvent[];
  schoolDays: SchoolDays;
  timetable: TimetableData;
  weeklyHours: WeeklyHoursData;
  updatedAt?: any;
  updatedBy?: string;
}

const COLLECTION_NAME = 'annualCalendar';

const INITIAL_EVENTS: Omit<AcademicEvent, 'linkedEventId'>[] = [
  { id: '1', name: '시업식', date: '2026-03-03', time: '', notes: '급식 실시(1학년 제외)' },
  { id: '2', name: '입학식', date: '2026-03-03', time: '10:00', notes: '1학년' },
  { id: '3', name: '여름방학식', date: '2026-07-28', time: '', notes: '급식 실시' },
  { id: '4', name: '여름방학', date: '2026-07-29', endDate: '2026-08-19', notes: '22일 (공휴일포함)' },
  { id: '5', name: '개학식', date: '2026-08-20', time: '', notes: '급식 실시' },
  { id: '6', name: '학교장 재량휴업일 (1학기)', date: '2026-05-01', endDate: '2026-05-04', notes: '노동절/가족사랑연휴' },
  { id: '7', name: '학교장 재량휴업일 (2학기)', date: '2026-11-19', time: '', notes: '수능일' },
  { id: '8', name: '종업식', date: '2026-12-31', time: '', notes: '급식 미실시' },
  { id: '9', name: '졸업식', date: '2026-12-31', time: '10:00', notes: '' },
  { id: '10', name: '겨울방학', date: '2027-01-01', endDate: '2027-02-28', notes: '59일 (공휴일포함)' },
];

const INITIAL_SCHOOL_DAYS: SchoolDays = {
  semester1: {
    march: 21,
    april: 22,
    may: 17,
    june: 21,
    july: 19,
    total: 100,
    discretionaryDays: 2,
  },
  semester2: {
    august: 8,
    september: 20,
    october: 20,
    november: 20,
    december: 22,
    january: 0,
    february: 0,
    total: 90,
    discretionaryDays: 1,
  },
  totalSchoolDays: 190,
};

const INITIAL_TIMETABLE: TimetableData = {
  arrivalTime: '8:40~9:00',
  arrivalNote: '안전사고 발생 우려가 있으므로 등교시간 준수',
  lowerGrades: [
    { period: '1교시', time: '09:00~09:40' },
    { period: '2교시', time: '09:50~10:30' },
    { period: '3교시', time: '10:40~11:20' },
    { period: '4교시', time: '11:30~12:10' },
    { period: '5교시', time: '13:00~13:40' },
    { period: '6교시', time: '13:50~14:30' },
  ],
  upperGrades: [
    { period: '1교시', time: '09:00~09:40' },
    { period: '2교시', time: '09:50~10:30' },
    { period: '3교시', time: '10:40~11:20' },
    { period: '4-5교시', time: '11:30~12:50', notes: '블록수업' },
    { period: '6교시', time: '13:50~14:30' },
  ],
  lunchLower: {
    time: '12:10~13:00',
    schedule: ['12:05~12:10 교직원', '12:10~12:18 1-1', '12:18~12:26 1-2', '12:26~12:35 1-3'],
  },
  lunchUpper: {
    time: '12:50~13:50',
    schedule: ['12:50~12:58 2-1', '12:58~13:06 2-2', '13:06~13:15 2-3'],
  },
};

const INITIAL_WEEKLY_HOURS: WeeklyHoursData = {
  rows: [
    { grade: '1학년', mon: 5, tue: 5, wed: 4, thu: 5, fri: '4(5)' },
    { grade: '2학년', mon: 5, tue: 5, wed: 4, thu: 5, fri: 5 },
    { grade: '3학년', mon: 5, tue: 5, wed: 5, thu: 6, fri: 5 },
    { grade: '4학년', mon: 5, tue: 5, wed: 5, thu: 6, fri: 5 },
    { grade: '5학년', mon: 6, tue: 6, wed: 5, thu: 6, fri: 6 },
    { grade: '6학년', mon: 6, tue: 6, wed: 5, thu: 6, fri: 6 },
  ],
  homeStudyDays: 20,
};

export const getAnnualCalendarData = async (year: number): Promise<AnnualCalendarData | null> => {
  const docRef = doc(db, COLLECTION_NAME, `${year}`);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return docSnap.data() as AnnualCalendarData;
};

export const initializeAnnualCalendarData = (): AnnualCalendarData => ({
  year: 2026,
  events: INITIAL_EVENTS.map(e => ({ ...e })),
  schoolDays: JSON.parse(JSON.stringify(INITIAL_SCHOOL_DAYS)),
  timetable: JSON.parse(JSON.stringify(INITIAL_TIMETABLE)),
  weeklyHours: JSON.parse(JSON.stringify(INITIAL_WEEKLY_HOURS)),
});

export const saveAnnualCalendarData = async (
  data: AnnualCalendarData,
  userId: string
): Promise<void> => {
  if (!userId) {
    throw new Error('userId is required');
  }
  
  const docRef = doc(db, COLLECTION_NAME, `${data.year}`);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
};

export const syncEventToCalendar = async (
  event: AcademicEvent,
  userId: string
): Promise<string> => {
  const eventData = {
    title: event.name + (event.time ? ` (${event.time})` : ''),
    date: event.date,
    endDate: event.endDate || '',
    category: 'academic' as const,
    description: event.notes,
    isHoliday: event.name.includes('방학') || event.name.includes('휴업'),
    createdBy: userId,
  };

  if (event.linkedEventId) {
    await updateSchoolEvent(event.linkedEventId, eventData);
    return event.linkedEventId;
  } else {
    const newId = await addSchoolEvent(eventData);
    return newId;
  }
};

export const deleteEventFromCalendar = async (linkedEventId: string): Promise<void> => {
  if (linkedEventId) {
    try {
      await deleteSchoolEvent(linkedEventId);
    } catch (e) {
      console.warn('Failed to delete linked event:', e);
    }
  }
};

export const syncAllEventsToCalendar = async (
  events: AcademicEvent[],
  userId: string
): Promise<AcademicEvent[]> => {
  const updatedEvents: AcademicEvent[] = [];
  
  for (const event of events) {
    try {
      const linkedEventId = await syncEventToCalendar(event, userId);
      updatedEvents.push({ ...event, linkedEventId });
    } catch (error) {
      console.error(`Failed to sync event ${event.name}:`, error);
      updatedEvents.push(event);
    }
  }
  
  return updatedEvents;
};

export const formatDateKorean = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayOfWeek = days[date.getDay()];
  return `${year}.${month}.${day}.(${dayOfWeek})`;
};
