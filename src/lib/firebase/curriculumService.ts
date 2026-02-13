import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type {
  CrossSubjectCurriculumData,
  SafetyEducationSection,
  SafetyEducationItem,
  OptionalEducationItem,
  GradeHours,
  Grade,
  SAFETY_EDUCATION_SECTIONS,
  SECTION_ITEMS_CONFIG,
  OPTIONAL_EDUCATION_ITEMS,
} from '@/types';

const COLLECTION_NAME = 'curriculum';
const CROSS_SUBJECT_DOC = 'crossSubject';

const createEmptyGradeHours = (): GradeHours => ({
  sem1_gyo: 0,
  sem1_chang: 0,
  sem2_gyo: 0,
  sem2_chang: 0,
});

const createEmptyGrades = (): Record<Grade, GradeHours> => ({
  1: createEmptyGradeHours(),
  2: createEmptyGradeHours(),
  3: createEmptyGradeHours(),
  4: createEmptyGradeHours(),
  5: createEmptyGradeHours(),
  6: createEmptyGradeHours(),
});

export const initializeCrossSubjectData = (
  sections: typeof SAFETY_EDUCATION_SECTIONS,
  itemsConfig: typeof SECTION_ITEMS_CONFIG,
  optionalItems: typeof OPTIONAL_EDUCATION_ITEMS
): CrossSubjectCurriculumData => {
  const initialSections: SafetyEducationSection[] = sections.map((section) => ({
    ...section,
    items: itemsConfig[section.id].map((item, idx) => ({
      id: `${section.id}-${idx}`,
      name: item.name,
      hoursInfo: item.info,
      isRequired: item.required,
      grades: createEmptyGrades(),
    })),
  }));

  const initialOptionalItems: OptionalEducationItem[] = optionalItems.map((item) => ({
    ...item,
    checked: item.type === 'mandatory',
  }));

  return {
    year: new Date().getFullYear(),
    sections: initialSections,
    optionalItems: initialOptionalItems,
  };
};

export const getCrossSubjectData = async (year: number): Promise<CrossSubjectCurriculumData | null> => {
  const docRef = doc(db, COLLECTION_NAME, `${CROSS_SUBJECT_DOC}_${year}`);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return docSnap.data() as CrossSubjectCurriculumData;
};

export const saveCrossSubjectData = async (
  data: CrossSubjectCurriculumData,
  userId: string
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, `${CROSS_SUBJECT_DOC}_${data.year}`);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
};

export const updateSectionItemHours = async (
  year: number,
  sectionId: number,
  itemId: string,
  grade: Grade,
  field: keyof GradeHours,
  value: number,
  userId: string
): Promise<void> => {
  const data = await getCrossSubjectData(year);
  if (!data) return;

  const section = data.sections.find((s) => s.id === sectionId);
  if (!section) return;

  const item = section.items.find((i) => i.id === itemId);
  if (!item) return;

  item.grades[grade][field] = value;

  await saveCrossSubjectData(data, userId);
};

export const updateOptionalItemChecked = async (
  year: number,
  itemId: string,
  checked: boolean,
  userId: string
): Promise<void> => {
  const data = await getCrossSubjectData(year);
  if (!data) return;

  const item = data.optionalItems.find((i) => i.id === itemId);
  if (!item) return;

  item.checked = checked;

  await saveCrossSubjectData(data, userId);
};

export const calculateGradeTotal = (
  sections: SafetyEducationSection[],
  grade: Grade
): { sem1_gyo: number; sem1_chang: number; sem2_gyo: number; sem2_chang: number; total: number } => {
  let sem1_gyo = 0;
  let sem1_chang = 0;
  let sem2_gyo = 0;
  let sem2_chang = 0;

  sections.forEach((section) => {
    section.items.forEach((item) => {
      const gradeHours = item.grades[grade];
      sem1_gyo += gradeHours.sem1_gyo;
      sem1_chang += gradeHours.sem1_chang;
      sem2_gyo += gradeHours.sem2_gyo;
      sem2_chang += gradeHours.sem2_chang;
    });
  });

  return {
    sem1_gyo,
    sem1_chang,
    sem2_gyo,
    sem2_chang,
    total: sem1_gyo + sem1_chang + sem2_gyo + sem2_chang,
  };
};

export const calculateSectionTotal = (section: SafetyEducationSection): number => {
  let total = 0;
  section.items.forEach((item) => {
    ([1, 2, 3, 4, 5, 6] as Grade[]).forEach((grade) => {
      const gradeHours = item.grades[grade];
      total += gradeHours.sem1_gyo + gradeHours.sem1_chang + gradeHours.sem2_gyo + gradeHours.sem2_chang;
    });
  });
  return total;
};

export const calculateItemGradeTotal = (item: SafetyEducationItem, grade: Grade): number => {
  const gradeHours = item.grades[grade];
  return gradeHours.sem1_gyo + gradeHours.sem1_chang + gradeHours.sem2_gyo + gradeHours.sem2_chang;
};

export const calculateGrandTotal = (sections: SafetyEducationSection[]): number => {
  return sections.reduce((sum, section) => sum + calculateSectionTotal(section), 0);
};
