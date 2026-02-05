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
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './config';
import type { Schedule, Class, SpecialTeacher, Settings } from '@/types';

// ========== SCHEDULES ==========

export const getSchedules = async (
  semester: 1 | 2 | 'year' | 'all',
  type?: 'teacher' | 'class'
) => {
  let q = query(collection(db, 'schedules'));

  if (semester !== 'all') {
    if (semester === 'year') {
      q = query(q, where('semester', '==', 'year'));
    } else {
      q = query(q, where('semester', 'in', [semester, 'year']));
    }
  }

  if (type) {
    q = query(q, where('type', '==', type));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Schedule[];
};

export const getScheduleById = async (id: string) => {
  const docRef = doc(db, 'schedules', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Schedule;
};

export const updateSchedule = async (
  id: string,
  timetable: Schedule['timetable'],
  userId: string
) => {
  const docRef = doc(db, 'schedules', id);
  await updateDoc(docRef, {
    timetable,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
};

export const createSchedule = async (schedule: Omit<Schedule, 'id' | 'updatedAt'>) => {
  const docRef = doc(collection(db, 'schedules'));
  await setDoc(docRef, {
    ...schedule,
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getTeacherSchedule = async (
  teacherId: string,
  semester: 1 | 2,
  year: number
) => {
  const schedules = await getSchedules(semester, 'teacher');
  return schedules.find(s => s.targetId === teacherId && s.year === year) || null;
};

export const hasYearRoundSchedule = async (teacherId: string, year: number) => {
  const schedules = await getSchedules('year', 'teacher');
  return schedules.some(s => s.targetId === teacherId && s.year === year);
};

// ========== CLASSES ==========

export const getClasses = async () => {
  const snapshot = await getDocs(collection(db, 'classes'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Class[];
};

export const getClassById = async (id: string) => {
  const docRef = doc(db, 'classes', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Class;
};

export const updateClass = async (id: string, data: Partial<Class>) => {
  const docRef = doc(db, 'classes', id);
  await updateDoc(docRef, data);
};

export const createClass = async (classData: Class) => {
  const docRef = doc(db, 'classes', classData.id);
  await setDoc(docRef, classData);
};

// ========== TEACHERS ==========

export const getTeachers = async () => {
  const snapshot = await getDocs(collection(db, 'teachers'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SpecialTeacher[];
};

export const getTeacherById = async (id: string) => {
  const docRef = doc(db, 'teachers', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as SpecialTeacher;
};

export const updateTeacher = async (id: string, data: Partial<SpecialTeacher>) => {
  const docRef = doc(db, 'teachers', id);
  await updateDoc(docRef, data);
};

// ========== SETTINGS ==========

export const getSettings = async (): Promise<Settings | null> => {
  const docRef = doc(db, 'settings', 'main');
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return docSnap.data() as Settings;
};

export const updateSettings = async (data: Partial<Settings>) => {
  const docRef = doc(db, 'settings', 'main');
  await updateDoc(docRef, data);
};

export const initializeSettings = async () => {
  const docRef = doc(db, 'settings', 'main');
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, {
      specialCode: '20261234',
      currentSemester: 1,
      currentYear: 2026,
      admins: [],
    });
  }
};

// ========== ADMIN MANAGEMENT ==========

export const addAdmin = async (userId: string) => {
  const settingsRef = doc(db, 'settings', 'main');
  await updateDoc(settingsRef, {
    admins: arrayUnion(userId),
  });

  // Update user role
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    role: 'admin',
    isAdmin: true,
  });
};

export const removeAdmin = async (userId: string) => {
  const settingsRef = doc(db, 'settings', 'main');
  await updateDoc(settingsRef, {
    admins: arrayRemove(userId),
  });

  // Update user role
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    role: 'teacher',
    isAdmin: false,
  });
};

// ========== USERS ==========

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};
