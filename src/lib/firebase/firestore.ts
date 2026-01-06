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
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { Schedule, Class, SpecialTeacher, Settings, DayOfWeek } from '@/types';

export async function getSchedules(semester: 1 | 2, type: 'teacher' | 'class'): Promise<Schedule[]> {
  const schedulesRef = collection(db, 'schedules');
  const q = query(
    schedulesRef,
    where('semester', '==', semester),
    where('type', '==', type)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule));
}

export async function getScheduleByTarget(
  semester: 1 | 2,
  type: 'teacher' | 'class',
  targetId: string
): Promise<Schedule | null> {
  const schedulesRef = collection(db, 'schedules');
  const q = query(
    schedulesRef,
    where('semester', '==', semester),
    where('type', '==', type),
    where('targetId', '==', targetId)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Schedule;
}

export async function updateSchedule(
  scheduleId: string,
  timetable: Schedule['timetable'],
  userId: string
): Promise<void> {
  const scheduleRef = doc(db, 'schedules', scheduleId);
  await updateDoc(scheduleRef, {
    timetable,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
}

export async function createSchedule(
  schedule: Omit<Schedule, 'id' | 'updatedAt'>
): Promise<string> {
  const schedulesRef = collection(db, 'schedules');
  const newDoc = doc(schedulesRef);
  
  await setDoc(newDoc, {
    ...schedule,
    updatedAt: serverTimestamp(),
  });
  
  return newDoc.id;
}

export async function getClasses(): Promise<Class[]> {
  const classesRef = collection(db, 'classes');
  const snapshot = await getDocs(classesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
}

export async function updateClass(classId: string, data: Partial<Class>): Promise<void> {
  const classRef = doc(db, 'classes', classId);
  await updateDoc(classRef, data);
}

export async function getSpecialTeachers(): Promise<SpecialTeacher[]> {
  const teachersRef = collection(db, 'teachers');
  const snapshot = await getDocs(teachersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SpecialTeacher));
}

export async function updateSpecialTeacher(
  teacherId: string,
  data: Partial<SpecialTeacher>
): Promise<void> {
  const teacherRef = doc(db, 'teachers', teacherId);
  await updateDoc(teacherRef, data);
}

export async function getSettings(): Promise<Settings | null> {
  const settingsRef = doc(db, 'settings', 'main');
  const snapshot = await getDoc(settingsRef);
  
  if (snapshot.exists()) {
    return { id: 'main', ...snapshot.data() } as Settings;
  }
  return null;
}

export async function updateSettings(data: Partial<Settings>): Promise<void> {
  const settingsRef = doc(db, 'settings', 'main');
  await updateDoc(settingsRef, data);
}

export async function initializeSettings(): Promise<void> {
  const settingsRef = doc(db, 'settings', 'main');
  const snapshot = await getDoc(settingsRef);
  
  if (!snapshot.exists()) {
    await setDoc(settingsRef, {
      specialCode: '20261234',
      currentSemester: 1,
      currentYear: 2026,
      admins: [],
    });
  }
}

export async function batchCreateSchedules(schedules: Omit<Schedule, 'id' | 'updatedAt'>[]): Promise<void> {
  const batch = writeBatch(db);
  const schedulesRef = collection(db, 'schedules');
  
  schedules.forEach(schedule => {
    const newDoc = doc(schedulesRef);
    batch.set(newDoc, {
      ...schedule,
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
}

export async function batchCreateClasses(classes: Class[]): Promise<void> {
  const batch = writeBatch(db);
  
  classes.forEach(classData => {
    const classRef = doc(db, 'classes', classData.id);
    batch.set(classRef, classData);
  });
  
  await batch.commit();
}

export async function batchCreateTeachers(teachers: SpecialTeacher[]): Promise<void> {
  const batch = writeBatch(db);
  
  teachers.forEach(teacher => {
    const teacherRef = doc(db, 'teachers', teacher.id);
    batch.set(teacherRef, teacher);
  });
  
  await batch.commit();
}
