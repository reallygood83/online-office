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
  writeBatch,
  arrayUnion,
  arrayRemove,
  addDoc,
} from 'firebase/firestore';
import { db } from './config';
import { 
  Schedule, 
  Class, 
  SpecialTeacher, 
  Settings, 
  DayOfWeek, 
  User,
  SpecialRoom,
  RoomReservation,
  ReservationPeriod,
  SchoolEvent,
  EventCategory,
} from '@/types';

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

export async function getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

export async function updateUserRole(uid: string, isAdmin: boolean): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isAdmin,
    role: isAdmin ? 'admin' : 'teacher',
  });
}

export async function addAdmin(uid: string): Promise<void> {
  await updateUserRole(uid, true);
  const settingsRef = doc(db, 'settings', 'main');
  await updateDoc(settingsRef, { admins: arrayUnion(uid) });
}

export async function removeAdmin(uid: string): Promise<void> {
  await updateUserRole(uid, false);
  const settingsRef = doc(db, 'settings', 'main');
  await updateDoc(settingsRef, { admins: arrayRemove(uid) });
}

export interface TeacherRealName {
  teacherId: string;
  realName: string;
  updatedAt?: any;
}

export async function getTeacherRealNames(): Promise<Record<string, string>> {
  try {
    const teachersRef = collection(db, 'teacherNames');
    const snapshot = await getDocs(teachersRef);
    const names: Record<string, string> = {};
    snapshot.docs.forEach(doc => {
      names[doc.id] = doc.data().realName;
    });
    return names;
  } catch (error) {
    console.error('Failed to fetch teacher names:', error);
    return {};
  }
}

export async function updateTeacherRealName(teacherId: string, realName: string): Promise<void> {
  const teacherRef = doc(db, 'teacherNames', teacherId);
  await setDoc(teacherRef, {
    teacherId,
    realName,
    updatedAt: serverTimestamp(),
  });
}

export async function batchUpdateTeacherRealNames(names: Record<string, string>): Promise<void> {
  const batch = writeBatch(db);
  
  Object.entries(names).forEach(([teacherId, realName]) => {
    const teacherRef = doc(db, 'teacherNames', teacherId);
    batch.set(teacherRef, {
      teacherId,
      realName,
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
}

export interface ClassHomeTeacher {
  classId: string;
  homeTeacher: string;
  updatedAt?: any;
}

export async function getClassHomeTeachers(): Promise<Record<string, string>> {
  try {
    const classesRef = collection(db, 'classHomeTeachers');
    const snapshot = await getDocs(classesRef);
    const teachers: Record<string, string> = {};
    snapshot.docs.forEach(doc => {
      teachers[doc.id] = doc.data().homeTeacher;
    });
    return teachers;
  } catch (error) {
    console.error('Failed to fetch home teachers:', error);
    return {};
  }
}

export async function updateClassHomeTeacher(classId: string, homeTeacher: string): Promise<void> {
  const classRef = doc(db, 'classHomeTeachers', classId);
  await setDoc(classRef, {
    classId,
    homeTeacher,
    updatedAt: serverTimestamp(),
  });
}

export async function batchUpdateClassHomeTeachers(teachers: Record<string, string>): Promise<void> {
  const batch = writeBatch(db);
  
  Object.entries(teachers).forEach(([classId, homeTeacher]) => {
    const classRef = doc(db, 'classHomeTeachers', classId);
    batch.set(classRef, {
      classId,
      homeTeacher,
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
}

export interface TeacherInfoData {
  subject: string;
  weeklyHours: number;
  targetGrades: string;
}

export async function getTeacherInfoOverrides(): Promise<Record<string, Partial<TeacherInfoData>>> {
  try {
    const teachersRef = collection(db, 'teacherInfoOverrides');
    const snapshot = await getDocs(teachersRef);
    const overrides: Record<string, Partial<TeacherInfoData>> = {};
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      overrides[docSnap.id] = {
        subject: data.subject,
        weeklyHours: data.weeklyHours,
        targetGrades: data.targetGrades,
      };
    });
    return overrides;
  } catch (error) {
    console.error('Failed to fetch teacher info overrides:', error);
    return {};
  }
}

export async function updateTeacherInfo(
  teacherId: string, 
  data: Partial<TeacherInfoData>
): Promise<void> {
  const teacherRef = doc(db, 'teacherInfoOverrides', teacherId);
  await setDoc(teacherRef, {
    teacherId,
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getAdminCode(): Promise<string> {
  try {
    const settingsRef = doc(db, 'settings', 'main');
    const snapshot = await getDoc(settingsRef);
    if (snapshot.exists()) {
      return snapshot.data().adminCode || '20261234';
    }
    return '20261234';
  } catch (error) {
    console.error('Failed to get admin code:', error);
    return '20261234';
  }
}

export async function verifyAdminCode(code: string): Promise<boolean> {
  const adminCode = await getAdminCode();
  return code === adminCode;
}

export async function updateAdminCode(newCode: string): Promise<void> {
  const settingsRef = doc(db, 'settings', 'main');
  await setDoc(settingsRef, {
    adminCode: newCode,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function setUserAsAdmin(uid: string, userInfo?: { email: string; displayName: string }): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userData: Record<string, any> = {
    isAdmin: true,
    role: 'admin',
    updatedAt: serverTimestamp(),
  };
  
  if (userInfo) {
    userData.email = userInfo.email;
    userData.displayName = userInfo.displayName;
    userData.createdAt = serverTimestamp();
  }
  
  await setDoc(userRef, userData, { merge: true });
  
  const settingsRef = doc(db, 'settings', 'main');
  await setDoc(settingsRef, {
    admins: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getSpecialRooms(): Promise<SpecialRoom[]> {
  const roomsRef = collection(db, 'specialRooms');
  const q = query(roomsRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as SpecialRoom));
}

export async function addSpecialRoom(room: Omit<SpecialRoom, 'id' | 'createdAt'>): Promise<string> {
  const roomsRef = collection(db, 'specialRooms');
  const data: Record<string, unknown> = {
    name: room.name,
    color: room.color,
    order: room.order,
    createdAt: serverTimestamp(),
  };
  if (room.description) {
    data.description = room.description;
  }
  const docRef = await addDoc(roomsRef, data);
  return docRef.id;
}

export async function updateSpecialRoom(roomId: string, data: Partial<Omit<SpecialRoom, 'id' | 'createdAt'>>): Promise<void> {
  const roomRef = doc(db, 'specialRooms', roomId);
  const cleanData: Record<string, unknown> = {};
  if (data.name !== undefined) cleanData.name = data.name;
  if (data.color !== undefined) cleanData.color = data.color;
  if (data.order !== undefined) cleanData.order = data.order;
  if (data.description !== undefined) cleanData.description = data.description;
  await updateDoc(roomRef, cleanData);
}

export async function deleteSpecialRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, 'specialRooms', roomId);
  await deleteDoc(roomRef);
}

export async function getWeekReservations(roomId: string, weekStart: string): Promise<RoomReservation[]> {
  const reservationsRef = collection(db, 'roomReservations');
  const q = query(
    reservationsRef,
    where('roomId', '==', roomId),
    where('weekStart', '==', weekStart)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as RoomReservation));
}

export async function getAllWeekReservations(weekStart: string): Promise<RoomReservation[]> {
  const reservationsRef = collection(db, 'roomReservations');
  const q = query(reservationsRef, where('weekStart', '==', weekStart));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as RoomReservation));
}

export async function createReservation(
  reservation: Omit<RoomReservation, 'id' | 'createdAt'>
): Promise<string> {
  const reservationsRef = collection(db, 'roomReservations');
  const docRef = await addDoc(reservationsRef, {
    ...reservation,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteReservation(reservationId: string): Promise<void> {
  const reservationRef = doc(db, 'roomReservations', reservationId);
  await deleteDoc(reservationRef);
}

export async function getSchoolEvents(year: number, month: number): Promise<SchoolEvent[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
  const eventsRef = collection(db, 'schoolEvents');
  const q = query(
    eventsRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as SchoolEvent));
}

export async function getSchoolEventsByRange(startDate: string, endDate: string): Promise<SchoolEvent[]> {
  const eventsRef = collection(db, 'schoolEvents');
  const q = query(
    eventsRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as SchoolEvent));
}

export async function addSchoolEvent(event: Omit<SchoolEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const eventsRef = collection(db, 'schoolEvents');
  const docRef = await addDoc(eventsRef, {
    ...event,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSchoolEvent(
  eventId: string, 
  data: Partial<Omit<SchoolEvent, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const eventRef = doc(db, 'schoolEvents', eventId);
  await updateDoc(eventRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSchoolEvent(eventId: string): Promise<void> {
  const eventRef = doc(db, 'schoolEvents', eventId);
  await deleteDoc(eventRef);
}
