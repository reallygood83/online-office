import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

export async function initializeFirestoreData() {
  const settingsRef = doc(db, 'settings', 'main');
  const settingsSnap = await getDoc(settingsRef);

  if (!settingsSnap.exists()) {
    await setDoc(settingsRef, {
      specialCode: '20261234',
      currentSemester: 1,
      currentYear: 2026,
      admins: [],
    });
    console.log('Settings initialized');
  }

  const teachers = [
    { id: '영어1', name: '', subject: '영어', weeklyHours: 20, targetClasses: ['5-1', '5-2', '5-3', '5-4', '5-5', '5-6', '3-6'] },
    { id: '영전강', name: '', subject: '영어', weeklyHours: 20, targetClasses: ['6-1', '6-2', '6-3', '6-4', '6-5', '6-6', '4-6'] },
    { id: '영어2', name: '', subject: '영어', weeklyHours: 20, targetClasses: ['3-1', '3-2', '3-3', '3-4', '3-5', '4-1', '4-2', '4-3', '4-4', '4-5'] },
    { id: '체육1', name: '', subject: '체육', weeklyHours: 18, targetClasses: ['1-1', '1-2', '1-3', '1-4', '3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '5-6'] },
    { id: '체육2', name: '', subject: '체육', weeklyHours: 22, targetClasses: ['4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '5-1', '5-2', '5-3', '5-4', '5-5'] },
    { id: '체육3', name: '', subject: '체육', weeklyHours: 22, targetClasses: ['2-1', '2-2', '2-3', '2-4', '6-1', '6-2', '6-3', '6-4', '6-5', '6-6'] },
    { id: '음악', name: '', subject: '음악', weeklyHours: 18, targetClasses: ['5-1', '5-2', '5-3', '5-4', '5-5', '5-6', '6-1', '6-2', '6-3', '6-4', '6-5', '6-6'] },
    { id: '도덕', name: '', subject: '도덕', weeklyHours: 16, targetClasses: [] },
  ];

  for (const teacher of teachers) {
    const teacherRef = doc(db, 'teachers', teacher.id);
    const teacherSnap = await getDoc(teacherRef);
    
    if (!teacherSnap.exists()) {
      await setDoc(teacherRef, teacher);
      console.log(`Teacher ${teacher.id} initialized`);
    }
  }

  const classes = [
    ...['1-1', '1-2', '1-3', '1-4'].map(id => ({
      id,
      grade: 1,
      classNumber: parseInt(id.split('-')[1]),
      homeTeacherName: '',
      semester1Hours: 1,
      semester2Hours: 2,
    })),
    ...['2-1', '2-2', '2-3', '2-4'].map(id => ({
      id,
      grade: 2,
      classNumber: parseInt(id.split('-')[1]),
      homeTeacherName: '',
      semester1Hours: 2,
      semester2Hours: 1,
    })),
    ...['3-1', '3-2', '3-3', '3-4', '3-5', '3-6'].map(id => ({
      id,
      grade: 3,
      classNumber: parseInt(id.split('-')[1]),
      homeTeacherName: '',
      semester1Hours: 4,
      semester2Hours: 5,
    })),
    ...['4-1', '4-2', '4-3', '4-4', '4-5', '4-6'].map(id => ({
      id,
      grade: 4,
      classNumber: parseInt(id.split('-')[1]),
      homeTeacherName: '',
      semester1Hours: 5,
      semester2Hours: 4,
    })),
    ...['5-1', '5-2', '5-3', '5-4', '5-5', '5-6'].map(id => ({
      id,
      grade: 5,
      classNumber: parseInt(id.split('-')[1]),
      homeTeacherName: '',
      semester1Hours: 7,
      semester2Hours: 8,
    })),
    ...['6-1', '6-2', '6-3', '6-4', '6-5', '6-6'].map(id => ({
      id,
      grade: 6,
      classNumber: parseInt(id.split('-')[1]),
      homeTeacherName: '',
      semester1Hours: 8,
      semester2Hours: 7,
    })),
  ];

  for (const classData of classes) {
    const classRef = doc(db, 'classes', classData.id);
    const classSnap = await getDoc(classRef);
    
    if (!classSnap.exists()) {
      await setDoc(classRef, classData);
      console.log(`Class ${classData.id} initialized`);
    }
  }

  console.log('Firestore initialization complete!');
}
