import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { addSchoolEvent, updateSchoolEvent, deleteSchoolEvent } from './firestore';
import type { CurriculumScheduleItem } from '@/types';

const COLLECTION_NAME = 'curriculumSchedule';

export const getCurriculumScheduleItems = async (year: number): Promise<CurriculumScheduleItem[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('year', '==', year),
    orderBy('month', 'asc'),
    orderBy('startDate', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CurriculumScheduleItem));
};

export const getCurriculumScheduleByMonth = async (
  year: number,
  month: number
): Promise<CurriculumScheduleItem[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('year', '==', year),
    where('month', '==', month),
    orderBy('startDate', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CurriculumScheduleItem));
};

export const addCurriculumScheduleItem = async (
  item: Omit<CurriculumScheduleItem, 'id' | 'createdAt' | 'updatedAt' | 'linkedEventId'>,
  userId: string
): Promise<string> => {
  const docRef = doc(collection(db, COLLECTION_NAME));

  const eventId = await addSchoolEvent({
    title: item.activityName,
    date: item.startDate,
    endDate: item.endDate,
    category: 'academic',
    description: `${item.subject} | ${item.notes || ''}`,
    isHoliday: false,
    createdBy: userId,
  });

  await setDoc(docRef, {
    ...item,
    linkedEventId: eventId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });

  return docRef.id;
};

export const updateCurriculumScheduleItem = async (
  id: string,
  data: Partial<CurriculumScheduleItem>,
  userId: string
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return;

  const existingData = docSnap.data() as CurriculumScheduleItem;

  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });

  if (existingData.linkedEventId) {
    await updateSchoolEvent(existingData.linkedEventId, {
      title: data.activityName || existingData.activityName,
      date: data.startDate || existingData.startDate,
      endDate: data.endDate || existingData.endDate,
      description: `${data.subject || existingData.subject} | ${data.notes || existingData.notes || ''}`,
    });
  }
};

export const deleteCurriculumScheduleItem = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as CurriculumScheduleItem;
    if (data.linkedEventId) {
      try {
        await deleteSchoolEvent(data.linkedEventId);
      } catch (e) {
        console.warn('Failed to delete linked event:', e);
      }
    }
  }

  await deleteDoc(docRef);
};

export const createEmptyScheduleItem = (year: number, month: number): Omit<CurriculumScheduleItem, 'id'> => ({
  month,
  startDate: '',
  endDate: '',
  activityName: '',
  gradeHours: {
    grade1: null,
    grade2: null,
    grade3: null,
    grade4: null,
    grade5: null,
    grade6: null,
  },
  subject: '',
  notes: '',
  year,
});

export const INITIAL_SCHEDULE_DATA: Omit<CurriculumScheduleItem, 'id' | 'year' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'linkedEventId'>[] = [
  { month: 3, startDate: '2026-03-03', activityName: '시업식(1교시)', gradeHours: { grade1: null, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '창체(자율자치)', notes: '2~6학년 4교시 편성(급식 실시)' },
  { month: 3, startDate: '2026-03-03', activityName: '입학식(2교시)', gradeHours: { grade1: 2, grade2: null, grade3: null, grade4: null, grade5: null, grade6: null }, subject: '창체(자율자치)', notes: '1학년 2교시 편성(급식 미실시)' },
  { month: 3, startDate: '2026-03-03', endDate: '2026-03-06', activityName: '학급세우기 주간', gradeHours: { grade1: null, grade2: null, grade3: null, grade4: null, grade5: null, grade6: null }, subject: '-', notes: '학년/학급 자체 계획' },
  { month: 3, startDate: '2026-03-09', activityName: '1학기 학급임원선거', gradeHours: { grade1: null, grade2: null, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '창체(자율자치)', notes: '' },
  { month: 3, startDate: '2026-03-09', endDate: '2026-03-13', activityName: '진단활동주간', gradeHours: { grade1: null, grade2: null, grade3: null, grade4: null, grade5: null, grade6: null }, subject: '-', notes: '학년/학급 자체 계획' },
  { month: 3, startDate: '2026-03-11', activityName: '진단평가', gradeHours: { grade1: null, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과(국1, 수1)', notes: '1~2교시 편성' },
  { month: 3, startDate: '2026-03-16', endDate: '2026-03-27', activityName: '학생건강체력평가(PAPS)주간', gradeHours: { grade1: null, grade2: null, grade3: null, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과(체육)', notes: '' },
  { month: 3, startDate: '2026-03-19', activityName: '학부모 총회', gradeHours: { grade1: null, grade2: null, grade3: null, grade4: null, grade5: null, grade6: null }, subject: '-', notes: '' },
  { month: 3, startDate: '2026-03-16', endDate: '2026-03-20', activityName: '학교폭력예방교육주간', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과 또는 창체', notes: '' },
  { month: 3, startDate: '2026-03-16', endDate: '2026-03-20', activityName: '가정폭력예방교육주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 3, startDate: '2026-03-23', endDate: '2026-03-27', activityName: '친구사랑주간', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과 또는 창체', notes: '' },
  { month: 3, startDate: '2026-03-30', endDate: '2026-04-03', activityName: '인성교육주간', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과 또는 창체', notes: '' },
  { month: 4, startDate: '2026-04-06', endDate: '2026-04-10', activityName: '생명존중 및 자살예방교육주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 4, startDate: '2026-04-15', activityName: '학부모 공개수업', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 4, startDate: '2026-04-17', activityName: '장애이해교육(1교시)', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 4, startDate: '2026-04-20', endDate: '2026-04-24', activityName: '과학의 날 주간', gradeHours: { grade1: 4, grade2: 4, grade3: 4, grade4: 4, grade5: 4, grade6: 4 }, subject: '교과(슬생, 과학)', notes: '' },
  { month: 4, startDate: '2026-04-20', endDate: '2026-04-24', activityName: '독서·인문·예술교육주간(책의 날)', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과 또는 창체', notes: '' },
  { month: 4, startDate: '2026-04-30', activityName: '공동체험의 날 (대박달콤)', gradeHours: { grade1: 3, grade2: 3, grade3: 3, grade4: 3, grade5: 3, grade6: 3 }, subject: '체육 또는 창체', notes: '' },
  { month: 5, startDate: '2026-05-11', endDate: '2026-05-15', activityName: '학생인권&교권교육주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 5, startDate: '2026-05-18', endDate: '2026-05-22', activityName: '다문화이해교육주간(세계인의 날)', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과 또는 창체', notes: '' },
  { month: 6, startDate: '2026-06-01', endDate: '2026-06-05', activityName: '생태환경교육주간', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과 또는 창체', notes: '' },
  { month: 6, startDate: '2026-06-08', endDate: '2026-06-12', activityName: '신체발달검사주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '창체(자율자치)', notes: '' },
  { month: 6, startDate: '2026-06-15', endDate: '2026-06-19', activityName: '정보통신윤리교육주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 6, startDate: '2026-06-23', activityName: '합동소방훈련', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '창체(자율자치)', notes: '소방서 일정에 따라 변동됨' },
  { month: 6, startDate: '2026-06-22', endDate: '2026-06-26', activityName: '나라사랑&통일안보교육주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 7, startDate: '2026-07-06', endDate: '2026-07-10', activityName: '인터넷중독예방교육 주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 7, startDate: '2026-07-21', activityName: '2학기 학급자치임원 선거', gradeHours: { grade1: null, grade2: null, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '창체(자율자치)', notes: '' },
  { month: 7, startDate: '2026-07-28', activityName: '여름방학식(4교시)', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '창체(자율자치)', notes: '1~6학년 4교시 편성(급식 실시)' },
  { month: 8, startDate: '2026-08-20', activityName: '여름방학 개학식(1교시)', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '창체(자율자치)', notes: '1~6학년 4교시 편성(급식실시)' },
  { month: 8, startDate: '2026-08-24', endDate: '2026-08-28', activityName: '학교폭력예방교육 주간', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과 또는 창체', notes: '' },
  { month: 8, startDate: '2026-08-31', endDate: '2026-09-04', activityName: '친구사랑주간', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과 또는 창체', notes: '' },
  { month: 9, startDate: '2026-09-07', endDate: '2026-09-11', activityName: '학생인권교육주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 9, startDate: '2026-09-14', endDate: '2026-09-18', activityName: '독서·인문·예술교육주간', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과 또는 창체', notes: '' },
  { month: 9, startDate: '2026-09-28', endDate: '2026-10-01', activityName: '아동학대예방교육주간', gradeHours: { grade1: 1, grade2: 1, grade3: 2, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 10, startDate: '2026-10-19', endDate: '2026-10-23', activityName: '독도교육 주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 10, startDate: '2026-10-22', activityName: '교육동행의 날', gradeHours: { grade1: 4, grade2: 4, grade3: 4, grade4: 4, grade5: 4, grade6: 4 }, subject: '교과 또는 창체', notes: '' },
  { month: 10, startDate: '2026-10-26', endDate: '2026-10-30', activityName: '스포츠클럽데이 주간', gradeHours: { grade1: 4, grade2: 4, grade3: 4, grade4: 4, grade5: 4, grade6: 4 }, subject: '교과(즐생, 체육)', notes: '' },
  { month: 11, startDate: '2026-11-02', endDate: '2026-11-06', activityName: '재난대응훈련주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '창체(자율자치)', notes: '' },
  { month: 11, startDate: '2026-11-09', endDate: '2026-11-13', activityName: '학교폭력예방교육주간', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과 또는 창체', notes: '' },
  { month: 11, startDate: '2026-11-12', activityName: '진로체험 한마당(1~4교시)', gradeHours: { grade1: 4, grade2: 4, grade3: 4, grade4: 4, grade5: 4, grade6: 4 }, subject: '창체(진로)', notes: '미정' },
  { month: 11, startDate: '2026-11-23', endDate: '2026-11-27', activityName: '장애인식개선교육 주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 11, startDate: '2026-11-23', endDate: '2026-11-27', activityName: '학급별 문화예술 발표 주간', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 2 }, subject: '교과 또는 창체', notes: '' },
  { month: 12, startDate: '2026-12-07', endDate: '2026-12-11', activityName: '학교폭력예방교육 집중운영주간', gradeHours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }, subject: '교과 또는 창체', notes: '' },
  { month: 12, startDate: '2026-12-10', activityName: '2027학년도 전교임원 선거(1~2교시)', gradeHours: { grade1: null, grade2: null, grade3: 2, grade4: 2, grade5: 2, grade6: null }, subject: '창체(자율자치)', notes: '' },
  { month: 12, startDate: '2026-12-31', activityName: '종업식 및 졸업식', gradeHours: { grade1: 2, grade2: 2, grade3: 2, grade4: 2, grade5: 2, grade6: 3 }, subject: '창체(자율자치)', notes: '1~5학년 2교시 편성, 6학년 3교시 편성, 급식미실시' },
];
