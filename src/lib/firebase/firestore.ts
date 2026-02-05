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
import type { Schedule, Class, SpecialTeacher, Settings, Announcement, SchoolEvent, SpecialRoom, RoomReservation, User, UserNotification, TeacherInfoData } from '@/types';

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
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[];
};

// ========== ANNOUNCEMENTS ==========

export const getAnnouncements = async () => {
  const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
};

export const createAnnouncement = async (data: Omit<Announcement, 'id' | 'createdAt'>) => {
  const docRef = doc(collection(db, 'announcements'));
  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
  const docRef = doc(db, 'announcements', id);
  await updateDoc(docRef, data);
};

export const deleteAnnouncement = async (id: string) => {
  const docRef = doc(db, 'announcements', id);
  await deleteDoc(docRef);
};

// ========== NOTIFICATIONS ==========

export const createNotificationsForAllUsers = async (notification: {
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead?: boolean;
  relatedId?: string;
}) => {
  const users = await getAllUsers();
  const promises = users.map(user => {
    const ref = doc(collection(db, 'notifications'));
    return setDoc(ref, {
      ...notification,
      userId: user.uid,
      isRead: false,
      createdAt: serverTimestamp()
    });
  });
  await Promise.all(promises);
};

export const getAllUsersWithEmail = async () => {
  const users = await getAllUsers();
  return users.filter(u => u.email);
};

export const getUserNotifications = async (userId: string, limitCount: number = 10) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  // Manual limit since 'limit' is not imported
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserNotification).slice(0, limitCount);
};

export const getUnreadNotificationCount = async (userId: string) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const docRef = doc(db, 'notifications', notificationId);
  await updateDoc(docRef, { isRead: true });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  const snapshot = await getDocs(q);
  const promises = snapshot.docs.map(docSnapshot => updateDoc(docSnapshot.ref, { isRead: true }));
  await Promise.all(promises);
};


// ========== SCHOOL EVENTS ==========

export const getSchoolEvents = async (year?: number, month?: number) => {
  const q = query(collection(db, 'events'));
  const snapshot = await getDocs(q);
  let events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SchoolEvent[];

  if (year && month) {
    events = events.filter(e => {
      // Handle both Firestore Timestamp (toDate) and JS Date/String
      const d = (e.date as any)?.toDate ? (e.date as any).toDate() : new Date(e.date);
      return d.getFullYear() === year && (d.getMonth() + 1) === month;
    });
  }

  return events;
};

export const addSchoolEvent = async (data: Omit<SchoolEvent, 'id'>) => {
  const docRef = doc(collection(db, 'events'));
  await setDoc(docRef, data);
  return docRef.id;
};

export const updateSchoolEvent = async (id: string, data: Partial<SchoolEvent>) => {
  const docRef = doc(db, 'events', id);
  await updateDoc(docRef, data);
};

export const deleteSchoolEvent = async (id: string) => {
  const docRef = doc(db, 'events', id);
  await deleteDoc(docRef);
};


// ========== SPECIAL ROOMS ==========

export const getSpecialRooms = async () => {
  const snapshot = await getDocs(collection(db, 'rooms'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SpecialRoom[];
};

export const addSpecialRoom = async (data: Omit<SpecialRoom, 'id'>) => {
  const docRef = doc(collection(db, 'rooms'));
  await setDoc(docRef, data);
  return docRef.id;
};

export const updateSpecialRoom = async (id: string, data: Partial<SpecialRoom>) => {
  const docRef = doc(db, 'rooms', id);
  await updateDoc(docRef, data);
};

export const deleteSpecialRoom = async (id: string) => {
  const docRef = doc(db, 'rooms', id);
  await deleteDoc(docRef);
};


// ========== RESERVATIONS ==========

export const getAllWeekReservations = async (weekStart: string) => {
  const q = query(collection(db, 'reservations'), where('weekStart', '==', weekStart));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RoomReservation[];
};

export const createReservation = async (data: Omit<RoomReservation, 'id' | 'createdAt'>) => {
  const docRef = doc(collection(db, 'reservations'));
  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const deleteReservation = async (id: string) => {
  const docRef = doc(db, 'reservations', id);
  await deleteDoc(docRef);
};


// ========== ADMIN CODE ==========

export const getAdminCode = async () => {
  const settings = await getSettings();
  return settings?.specialCode || '';
};


export const updateAdminCode = async (newCode: string) => {
  await updateSettings({ specialCode: newCode });
};

// ========== UTILS FOR NAMES ==========

export const getTeacherRealNames = async () => {
  const teachers = await getTeachers();
  const map: Record<string, string> = {};
  teachers.forEach(t => {
    if (t.name) map[t.id] = t.name;
  });
  return map;
};

export const getClassHomeTeachers = async () => {
  const classes = await getClasses();
  const map: Record<string, string> = {};
  classes.forEach(c => {
    if (c.homeTeacherName) map[c.id] = c.homeTeacherName;
  });
  return map;
};

export const updateClassHomeTeacher = async (classId: string, teacherName: string) => {
  const docRef = doc(db, 'classes', classId);
  await setDoc(docRef, { homeTeacherName: teacherName }, { merge: true });
};

// ========== TEACHER INFO ==========

export const updateTeacherRealName = async (teacherId: string, name: string) => {
  const docRef = doc(db, 'teachers', teacherId);
  await setDoc(docRef, { name }, { merge: true });
};

export const getTeacherInfoOverrides = async () => {
  const snapshot = await getDocs(collection(db, 'teachers'));
  const overrides: Record<string, Partial<TeacherInfoData>> = {};

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.subject || data.weeklyHours || data.targetGrades) {
      overrides[doc.id] = {
        subject: data.subject,
        weeklyHours: data.weeklyHours,
        targetGrades: data.targetGrades,
      };
    }
  });
  return overrides;
};

export const updateTeacherInfo = async (teacherId: string, data: Partial<TeacherInfoData>) => {
  const docRef = doc(db, 'teachers', teacherId);
  await setDoc(docRef, data, { merge: true });
};

// ========== ADMIN VERIFICATION ==========

export const verifyAdminCode = async (code: string) => {
  const settings = await getSettings();
  const validCode = settings?.specialCode || '2026';
  return validCode === code;
};

export const setUserAsAdmin = async (userId: string, userInfo?: { email: string; displayName: string }) => {
  await addAdmin(userId);
};

export const updateUserRole = async (userId: string, isAdmin: boolean) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    isAdmin,
    role: isAdmin ? 'admin' : 'teacher'
  });

  const settingsRef = doc(db, 'settings', 'main');
  if (isAdmin) {
    await updateDoc(settingsRef, {
      admins: arrayUnion(userId)
    });
  } else {
    await updateDoc(settingsRef, {
      admins: arrayRemove(userId)
    });
  }
};
