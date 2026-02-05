import {
  doc,
  setDoc,
  getDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { DayOfWeek } from '@/types';
import {
  TEACHER_SCHEDULES_SEMESTER1,
  TEACHER_SCHEDULES_SEMESTER2,
  TEACHER_INFO,
  ALL_CLASSES,
  TEACHERS,
  TeacherScheduleData,
  ClassScheduleData,
} from '@/data/scheduleData';

export interface ClassScheduleDoc {
  classId: string;
  semester: 1 | 2;
  schedule: ClassScheduleData;
  updatedAt: any;
  updatedBy?: string;
}

export interface TeacherScheduleDoc {
  teacherId: string;
  semester: 1 | 2;
  schedule: TeacherScheduleData;
  info: {
    subject: string;
    weeklyHours: number;
    targetGrades: string;
  };
  updatedAt: any;
}

export async function getClassScheduleFromDB(
  classId: string,
  semester: 1 | 2
): Promise<ClassScheduleData> {
  try {
    const docRef = doc(db, 'classSchedules', `${classId}_S${semester}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().schedule as ClassScheduleData;
    }
  } catch (error) {
    console.log('Firestore not available, using local data');
  }

  return computeClassScheduleFromTeachers(classId, semester);
}

function computeClassScheduleFromTeachers(
  classId: string,
  semester: 1 | 2
): ClassScheduleData {
  const teacherSchedules = semester === 1 ? TEACHER_SCHEDULES_SEMESTER1 : TEACHER_SCHEDULES_SEMESTER2;
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

  const result: ClassScheduleData = {
    mon: [null, null, null, null, null, null],
    tue: [null, null, null, null, null, null],
    wed: [null, null, null, null, null, null],
    thu: [null, null, null, null, null, null],
    fri: [null, null, null, null, null, null],
  };

  for (const [teacherId, schedule] of Object.entries(teacherSchedules)) {
    const teacherInfo = TEACHER_INFO[teacherId];

    for (const day of days) {
      for (let period = 0; period < 6; period++) {
        if (schedule[day][period] === classId) {
          result[day][period] = {
            subject: teacherInfo.subject,
            teacher: teacherId,
          };
        }
      }
    }
  }

  return result;
}

export async function saveClassSchedule(
  classId: string,
  semester: 1 | 2,
  schedule: ClassScheduleData,
  userId?: string
): Promise<void> {
  const docRef = doc(db, 'classSchedules', `${classId}_S${semester}`);
  await setDoc(docRef, {
    classId,
    semester,
    schedule,
    updatedAt: serverTimestamp(),
    updatedBy: userId || 'anonymous',
  });
}

export async function updateClassScheduleCell(
  classId: string,
  semester: 1 | 2,
  day: DayOfWeek,
  period: number,
  value: { subject: string; teacher: string } | null,
  userId?: string
): Promise<void> {
  const currentSchedule = await getClassScheduleFromDB(classId, semester);
  currentSchedule[day][period] = value;
  await saveClassSchedule(classId, semester, currentSchedule, userId);
}

export async function getTeacherScheduleFromDB(
  teacherId: string,
  semester: 1 | 2
): Promise<TeacherScheduleData> {
  try {
    const docRef = doc(db, 'teacherSchedules', `${teacherId}_S${semester}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().schedule as TeacherScheduleData;
    }
  } catch (error) {
    console.log('Firestore not available, using local data');
  }

  const schedules = semester === 1 ? TEACHER_SCHEDULES_SEMESTER1 : TEACHER_SCHEDULES_SEMESTER2;
  return schedules[teacherId];
}

export async function initializeScheduleData(): Promise<{ success: boolean; message: string }> {
  try {
    const batch = writeBatch(db);

    for (const teacherId of TEACHERS) {
      const s1Ref = doc(db, 'teacherSchedules', `${teacherId}_S1`);
      batch.set(s1Ref, {
        teacherId,
        semester: 1,
        schedule: TEACHER_SCHEDULES_SEMESTER1[teacherId],
        info: TEACHER_INFO[teacherId],
        updatedAt: serverTimestamp(),
      });

      const s2Ref = doc(db, 'teacherSchedules', `${teacherId}_S2`);
      batch.set(s2Ref, {
        teacherId,
        semester: 2,
        schedule: TEACHER_SCHEDULES_SEMESTER2[teacherId],
        info: TEACHER_INFO[teacherId],
        updatedAt: serverTimestamp(),
      });
    }

    for (const classId of ALL_CLASSES) {
      const s1Schedule = computeClassScheduleFromTeachers(classId, 1);
      const cs1Ref = doc(db, 'classSchedules', `${classId}_S1`);
      batch.set(cs1Ref, {
        classId,
        semester: 1,
        schedule: s1Schedule,
        updatedAt: serverTimestamp(),
      });

      const s2Schedule = computeClassScheduleFromTeachers(classId, 2);
      const cs2Ref = doc(db, 'classSchedules', `${classId}_S2`);
      batch.set(cs2Ref, {
        classId,
        semester: 2,
        schedule: s2Schedule,
        updatedAt: serverTimestamp(),
      });
    }

    const settingsRef = doc(db, 'settings', 'main');
    batch.set(settingsRef, {
      specialCode: '20261234',
      schoolName: '박달초등학교',
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return { success: true, message: '모든 시간표 데이터가 Firebase에 초기화되었습니다.' };
  } catch (error: any) {
    console.error('Initialize error:', error);
    return { success: false, message: `초기화 실패: ${error.message}` };
  }
}

export async function checkDataInitialized(): Promise<boolean> {
  try {
    const docRef = doc(db, 'settings', 'main');
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    return false;
  }
}

export function getTeacherOptions(): { value: string; label: string; subject: string }[] {
  return TEACHERS.map((teacherId) => ({
    value: teacherId,
    label: `${teacherId} (${TEACHER_INFO[teacherId].subject})`,
    subject: TEACHER_INFO[teacherId].subject,
  }));
}
