'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTeacherRealNames, getClassHomeTeachers } from '@/lib/firebase/firestore';

interface TeacherNamesContextType {
  teacherRealNames: Record<string, string>;
  homeTeachers: Record<string, string>;
  loading: boolean;
  refresh: () => Promise<void>;
  formatTeacherWithSubject: (teacherId: string, subject: string) => string;
  formatClassWithHomeTeacher: (classId: string) => string;
}

const TeacherNamesContext = createContext<TeacherNamesContextType | null>(null);

export function TeacherNamesProvider({ children }: { children: ReactNode }) {
  const [teacherRealNames, setTeacherRealNames] = useState<Record<string, string>>({});
  const [homeTeachers, setHomeTeachers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadNames = async () => {
    setLoading(true);
    try {
      const [realNames, homeTeacherNames] = await Promise.all([
        getTeacherRealNames(),
        getClassHomeTeachers(),
      ]);
      setTeacherRealNames(realNames);
      setHomeTeachers(homeTeacherNames);
    } catch (error) {
      console.error('Failed to load teacher names:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNames();
  }, []);

  const formatTeacherWithSubject = (teacherId: string, subject: string): string => {
    const realName = teacherRealNames[teacherId];
    return realName ? `${realName}(${subject})` : teacherId;
  };

  const formatClassWithHomeTeacher = (classId: string): string => {
    const homeTeacher = homeTeachers[classId];
    return homeTeacher ? `${classId}(${homeTeacher})` : classId;
  };

  return (
    <TeacherNamesContext.Provider
      value={{
        teacherRealNames,
        homeTeachers,
        loading,
        refresh: loadNames,
        formatTeacherWithSubject,
        formatClassWithHomeTeacher,
      }}
    >
      {children}
    </TeacherNamesContext.Provider>
  );
}

export function useTeacherNames() {
  const context = useContext(TeacherNamesContext);
  if (!context) {
    throw new Error('useTeacherNames must be used within a TeacherNamesProvider');
  }
  return context;
}
