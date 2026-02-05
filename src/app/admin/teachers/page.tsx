'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  SPECIAL_TEACHERS, 
  SUBJECT_COLORS, 
  GRADE_CLASS_CONFIG,
  getTeacherTargetClasses,
  SpecialTeacher,
} from '@/types';
import { getClasses, getTeachers } from '@/lib/firebase/firestore';
import TeacherForm from '@/components/admin/TeacherForm';

type TabType = 'special' | 'homeroom';

interface HomeroomTeacher {
  classId: string;
  name: string;
  grade: number;
  classNumber: number;
}

interface SpecialTeacherWithName {
  id: string;
  subject: string;
  weeklyHours: number;
  targetGrades: number[];
  name: string;
}

function TeachersPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam === 'homeroom' ? 'homeroom' : 'special'
  );
  const [specialTeachers, setSpecialTeachers] = useState<SpecialTeacherWithName[]>(
    SPECIAL_TEACHERS.map(t => ({ 
      id: t.id, 
      subject: t.subject, 
      weeklyHours: t.weeklyHours, 
      targetGrades: [...t.targetGrades],
      name: '' 
    }))
  );
  const [homeroomTeachers, setHomeroomTeachers] = useState<HomeroomTeacher[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingTeacher, setEditingTeacher] = useState<Partial<SpecialTeacher & { targetGrades?: number[] }> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const [firestoreTeachers, classes] = await Promise.all([
          getTeachers(),
          getClasses(),
        ]);
        
        const updatedSpecial: SpecialTeacherWithName[] = SPECIAL_TEACHERS.map(t => {
          const firestoreT = firestoreTeachers.find(ft => ft.id === t.id);
          return { 
            id: t.id, 
            subject: t.subject, 
            weeklyHours: t.weeklyHours, 
            targetGrades: [...t.targetGrades],
            name: firestoreT?.name || '' 
          };
        });
        setSpecialTeachers(updatedSpecial);
        
        const homeroom: HomeroomTeacher[] = [];
        for (const [gradeStr, classCount] of Object.entries(GRADE_CLASS_CONFIG)) {
          const grade = parseInt(gradeStr);
          for (let i = 1; i <= classCount; i++) {
            const classId = `${grade}-${i}`;
            const classInfo = classes.find(c => c.id === classId);
            homeroom.push({
              classId,
              name: classInfo?.homeTeacherName || '',
              grade,
              classNumber: i,
            });
          }
        }
        setHomeroomTeachers(homeroom);
      } catch (error) {
        console.error('Failed to load teachers:', error);
      }
    };
    
    loadTeachers();
  }, []);

  const handleAddTeacher = () => {
    setFormMode('add');
    setEditingTeacher(null);
    setIsFormOpen(true);
  };

  const handleEditTeacher = (teacher: SpecialTeacherWithName) => {
    setFormMode('edit');
    setEditingTeacher({
      id: teacher.id,
      name: teacher.name || '',
      subject: teacher.subject,
      weeklyHours: teacher.weeklyHours,
      targetGrades: [...teacher.targetGrades],
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<SpecialTeacher, 'targetClasses'> & { targetGrades: number[] }) => {
    try {
      if (formMode === 'add') {
        const newTeacher = {
          ...data,
          targetClasses: getTeacherTargetClasses(data.id),
        };
        setSpecialTeachers(prev => [...prev, { ...newTeacher, targetGrades: data.targetGrades }]);
      } else {
        setSpecialTeachers(prev => 
          prev.map(t => t.id === data.id 
            ? { ...t, name: data.name, subject: data.subject, weeklyHours: data.weeklyHours, targetGrades: data.targetGrades }
            : t
          )
        );
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to save teacher:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      setSpecialTeachers(prev => prev.filter(t => t.id !== teacherId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleHomeroomNameChange = (classId: string, name: string) => {
    setHomeroomTeachers(prev =>
      prev.map(t => t.classId === classId ? { ...t, name } : t)
    );
  };

  const subjectGroups = ['영어', '체육', '음악', '도덕'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">교사 관리</h1>
          <p className="text-gray-600 mt-1">전담교사와 담임교사를 관리합니다</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('special')}
          className={`
            px-6 py-3 font-bold border-3 border-black rounded-lg
            transition-all duration-150
            ${activeTab === 'special'
              ? 'bg-neo-cyan-300 shadow-neo-pressed translate-x-0.5 translate-y-0.5'
              : 'bg-white shadow-neo hover:shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5'
            }
          `}
        >
          전담교사 관리
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('homeroom')}
          className={`
            px-6 py-3 font-bold border-3 border-black rounded-lg
            transition-all duration-150
            ${activeTab === 'homeroom'
              ? 'bg-neo-pink-300 shadow-neo-pressed translate-x-0.5 translate-y-0.5'
              : 'bg-white shadow-neo hover:shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5'
            }
          `}
        >
          담임교사 관리
        </button>
      </div>

      {activeTab === 'special' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddTeacher}
              className="px-4 py-2 font-bold bg-neo-lime-300 border-3 border-black rounded-lg shadow-neo hover:shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              전담교사 추가
            </button>
          </div>

          {subjectGroups.map((subject) => {
            const teachers = specialTeachers.filter(t => t.subject === subject);
            const bgColor = SUBJECT_COLORS[subject] || 'bg-gray-200';
            
            return (
              <div key={subject} className="bg-white border-4 border-black rounded-xl shadow-neo-md overflow-hidden">
                <div className={`${bgColor} px-6 py-3 border-b-4 border-black flex items-center justify-between`}>
                  <h2 className="text-xl font-black">{subject} 전담</h2>
                  <span className="px-3 py-1 bg-white border-2 border-black rounded-full font-bold text-sm">
                    {teachers.length}명
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b-3 border-black">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold">ID</th>
                        <th className="px-4 py-3 text-left font-bold">이름</th>
                        <th className="px-4 py-3 text-center font-bold">주당 수업</th>
                        <th className="px-4 py-3 text-left font-bold">담당 학년</th>
                        <th className="px-4 py-3 text-center font-bold">담당 학급</th>
                        <th className="px-4 py-3 text-center font-bold">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher) => {
                        const targetClasses = getTeacherTargetClasses(teacher.id);
                        
                        return (
                          <tr key={teacher.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 ${bgColor} border-2 border-black rounded-lg font-bold`}>
                                {teacher.id}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {teacher.name || <span className="text-gray-400">미지정</span>}
                            </td>
                            <td className="px-4 py-3 text-center font-bold">
                              {teacher.weeklyHours}시간
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {teacher.targetGrades.map((grade) => (
                                  <span 
                                    key={grade}
                                    className="px-2 py-0.5 bg-gray-200 border border-black rounded text-xs font-bold"
                                  >
                                    {grade}학년
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-gray-600">
                              {targetClasses.length}개
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditTeacher(teacher)}
                                  className="px-3 py-1 font-bold bg-neo-yellow-300 border-2 border-black rounded-lg shadow-neo-sm hover:shadow-neo-pressed hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-sm"
                                >
                                  수정
                                </button>
                                {deleteConfirm === teacher.id ? (
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTeacher(teacher.id)}
                                      className="px-3 py-1 font-bold bg-red-500 text-white border-2 border-black rounded-lg text-sm"
                                    >
                                      확인
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirm(null)}
                                      className="px-3 py-1 font-bold bg-gray-200 border-2 border-black rounded-lg text-sm"
                                    >
                                      취소
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirm(teacher.id)}
                                    className="px-3 py-1 font-bold bg-neo-red-300 border-2 border-black rounded-lg shadow-neo-sm hover:shadow-neo-pressed hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-sm"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {teachers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            등록된 {subject} 전담교사가 없습니다
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'homeroom' && (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map((grade) => {
            const gradeTeachers = homeroomTeachers.filter(t => t.grade === grade);
            const gradeColors = [
              'bg-neo-pink-200',
              'bg-neo-orange-200', 
              'bg-neo-yellow-200',
              'bg-neo-lime-200',
              'bg-neo-cyan-200',
              'bg-neo-violet-200',
            ];
            
            return (
              <div key={grade} className="bg-white border-4 border-black rounded-xl shadow-neo-md overflow-hidden">
                <div className={`${gradeColors[grade - 1]} px-6 py-3 border-b-4 border-black flex items-center justify-between`}>
                  <h2 className="text-xl font-black">{grade}학년</h2>
                  <span className="px-3 py-1 bg-white border-2 border-black rounded-full font-bold text-sm">
                    {gradeTeachers.length}개 학급
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
                  {gradeTeachers.map((teacher) => (
                    <div 
                      key={teacher.classId}
                      className="p-4 bg-gray-50 border-3 border-black rounded-lg"
                    >
                      <div className="font-black text-lg mb-2">{teacher.classId}</div>
                      <input
                        type="text"
                        value={teacher.name}
                        onChange={(e) => handleHomeroomNameChange(teacher.classId, e.target.value)}
                        placeholder="담임 이름"
                        className="w-full px-3 py-2 border-2 border-black rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-neo-cyan-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end">
            <button
              type="button"
              className="px-6 py-3 font-bold bg-neo-cyan-300 border-3 border-black rounded-lg shadow-neo hover:shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              담임 정보 저장
            </button>
          </div>
        </div>
      )}

      <TeacherForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTeacher || undefined}
        mode={formMode}
        teacherType="special"
      />
    </div>
  );
}

export default function TeachersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="font-bold text-gray-500">로딩 중...</p>
        </div>
      </div>
    }>
      <TeachersPageContent />
    </Suspense>
  );
}
