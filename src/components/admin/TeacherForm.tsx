'use client';

import { useState, useEffect } from 'react';
import { SpecialTeacher, GRADE_CLASS_CONFIG } from '@/types';

interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teacher: Omit<SpecialTeacher, 'targetClasses'> & { targetGrades: number[] }) => void;
  initialData?: Partial<SpecialTeacher & { targetGrades?: number[] }>;
  mode: 'add' | 'edit';
  teacherType: 'special' | 'homeroom';
}

const SUBJECTS = ['영어', '체육', '음악', '도덕'];
const ALL_GRADES = [1, 2, 3, 4, 5, 6];

export default function TeacherForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  teacherType,
}: TeacherFormProps) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    subject: SUBJECTS[0],
    weeklyHours: 20,
    targetGrades: [...ALL_GRADES] as number[],
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        subject: initialData.subject || SUBJECTS[0],
        weeklyHours: initialData.weeklyHours || 20,
        targetGrades: initialData.targetGrades || [...ALL_GRADES],
      });
    } else {
      setFormData({
        id: '',
        name: '',
        subject: SUBJECTS[0],
        weeklyHours: 20,
        targetGrades: [...ALL_GRADES],
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const toggleGrade = (grade: number) => {
    setFormData(prev => {
      const grades = prev.targetGrades.includes(grade)
        ? prev.targetGrades.filter(g => g !== grade)
        : [...prev.targetGrades, grade].sort((a, b) => a - b);
      return { ...prev, targetGrades: grades };
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.id.trim()) {
      newErrors.id = '교사 ID를 입력하세요';
    }
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력하세요';
    }
    if (formData.weeklyHours < 1 || formData.weeklyHours > 40) {
      newErrors.weeklyHours = '주당 수업시간은 1~40 사이입니다';
    }
    if (teacherType === 'special' && formData.targetGrades.length === 0) {
      newErrors.targetGrades = '최소 1개 학년을 선택하세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit({
      id: formData.id.trim(),
      name: formData.name.trim(),
      subject: formData.subject,
      weeklyHours: formData.weeklyHours,
      targetGrades: formData.targetGrades,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white border-4 border-black rounded-2xl shadow-neo-lg p-6 animate-bounce-sm">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-neo-red-300 border-2 border-black rounded-lg flex items-center justify-center shadow-neo-sm hover:shadow-neo-pressed hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-black mb-6">
          {mode === 'add' ? '교사 추가' : '교사 수정'}
          <span className="ml-2 px-2 py-1 bg-neo-cyan-200 border-2 border-black rounded-lg text-sm">
            {teacherType === 'special' ? '전담교사' : '담임교사'}
          </span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">교사 ID</label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
              placeholder="예: 영어1, 체육2"
              disabled={mode === 'edit'}
              className={`
                w-full px-4 py-2 border-3 border-black rounded-lg font-medium
                shadow-neo-sm focus:shadow-neo-pressed focus:translate-x-0.5 focus:translate-y-0.5
                transition-all outline-none
                ${mode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''}
                ${errors.id ? 'border-red-500 bg-red-50' : ''}
              `}
            />
            {errors.id && <p className="mt-1 text-sm text-red-600 font-medium">{errors.id}</p>}
          </div>

          <div>
            <label className="block font-bold mb-1">이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="교사 이름"
              className={`
                w-full px-4 py-2 border-3 border-black rounded-lg font-medium
                shadow-neo-sm focus:shadow-neo-pressed focus:translate-x-0.5 focus:translate-y-0.5
                transition-all outline-none
                ${errors.name ? 'border-red-500 bg-red-50' : ''}
              `}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600 font-medium">{errors.name}</p>}
          </div>

          {teacherType === 'special' && (
            <>
              <div>
                <label className="block font-bold mb-1">과목</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, subject }))}
                      className={`
                        px-4 py-2 font-bold border-3 border-black rounded-lg
                        transition-all duration-150
                        ${formData.subject === subject 
                          ? 'bg-neo-yellow-300 shadow-neo-pressed translate-x-0.5 translate-y-0.5' 
                          : 'bg-white shadow-neo-sm hover:shadow-neo-pressed hover:translate-x-0.5 hover:translate-y-0.5'
                        }
                      `}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">주당 수업시간</label>
                <input
                  type="number"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))}
                  min={1}
                  max={40}
                  className={`
                    w-32 px-4 py-2 border-3 border-black rounded-lg font-medium text-center
                    shadow-neo-sm focus:shadow-neo-pressed focus:translate-x-0.5 focus:translate-y-0.5
                    transition-all outline-none
                    ${errors.weeklyHours ? 'border-red-500 bg-red-50' : ''}
                  `}
                />
                <span className="ml-2 text-gray-600 font-medium">시간</span>
                {errors.weeklyHours && <p className="mt-1 text-sm text-red-600 font-medium">{errors.weeklyHours}</p>}
              </div>

              <div>
                <label className="block font-bold mb-2">담당 학년</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GRADES.map((grade) => {
                    const isSelected = formData.targetGrades.includes(grade);
                    const classCount = GRADE_CLASS_CONFIG[grade as keyof typeof GRADE_CLASS_CONFIG];
                    
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => toggleGrade(grade)}
                        className={`
                          px-3 py-2 font-bold border-3 border-black rounded-lg
                          transition-all duration-150 min-w-[60px]
                          ${isSelected 
                            ? 'bg-neo-lime-300 shadow-neo-pressed translate-x-0.5 translate-y-0.5' 
                            : 'bg-white shadow-neo-sm hover:shadow-neo-pressed hover:translate-x-0.5 hover:translate-y-0.5'
                          }
                        `}
                      >
                        <div>{grade}학년</div>
                        <div className="text-xs text-gray-600">{classCount}반</div>
                      </button>
                    );
                  })}
                </div>
                {errors.targetGrades && <p className="mt-1 text-sm text-red-600 font-medium">{errors.targetGrades}</p>}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 font-bold bg-gray-200 border-3 border-black rounded-lg shadow-neo hover:shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 font-bold bg-neo-cyan-300 border-3 border-black rounded-lg shadow-neo hover:shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              {mode === 'add' ? '추가' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
