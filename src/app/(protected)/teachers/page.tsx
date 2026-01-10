'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, Select } from '@/components/ui';
import { TEACHERS, TEACHER_INFO, SUBJECT_BG_COLORS, SPECIALIST_SUBJECTS } from '@/data/scheduleData';
import { 
  getTeacherRealNames, 
  updateTeacherRealName, 
  getTeacherInfoOverrides, 
  updateTeacherInfo,
  TeacherInfoData 
} from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTeacherNames } from '@/lib/hooks/useTeacherNames';

interface TeacherData {
  subject: string;
  weeklyHours: number;
  targetGrades: string;
}

export default function TeachersPage() {
  const { user } = useAuth();
  const { refresh: refreshTeacherNames } = useTeacherNames();
  const [realNames, setRealNames] = useState<Record<string, string>>({});
  const [teacherInfoOverrides, setTeacherInfoOverrides] = useState<Record<string, Partial<TeacherInfoData>>>({});
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editTargetGrades, setEditTargetGrades] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [names, overrides] = await Promise.all([
      getTeacherRealNames(),
      getTeacherInfoOverrides(),
    ]);
    setRealNames(names);
    setTeacherInfoOverrides(overrides);
    setLoading(false);
  };

  const getTeacherInfo = (teacherId: string): TeacherData => {
    const defaultInfo = TEACHER_INFO[teacherId];
    const override = teacherInfoOverrides[teacherId];
    return {
      subject: override?.subject ?? defaultInfo.subject,
      weeklyHours: override?.weeklyHours ?? defaultInfo.weeklyHours,
      targetGrades: override?.targetGrades ?? defaultInfo.targetGrades,
    };
  };

  const handleEditClick = (teacherId: string) => {
    const info = getTeacherInfo(teacherId);
    setEditingTeacher(teacherId);
    setEditName(realNames[teacherId] || '');
    setEditSubject(info.subject);
    setEditHours(info.weeklyHours.toString());
    setEditTargetGrades(info.targetGrades);
  };

  const handleSave = async () => {
    if (!editingTeacher) return;

    setSaving(true);
    try {
      const promises: Promise<void>[] = [];
      
      if (editName.trim()) {
        promises.push(updateTeacherRealName(editingTeacher, editName.trim()));
        setRealNames(prev => ({ ...prev, [editingTeacher]: editName.trim() }));
      }

      const hours = parseInt(editHours, 10);
      if (editSubject && !isNaN(hours)) {
        promises.push(updateTeacherInfo(editingTeacher, {
          subject: editSubject,
          weeklyHours: hours,
          targetGrades: editTargetGrades,
        }));
        setTeacherInfoOverrides(prev => ({
          ...prev,
          [editingTeacher]: {
            subject: editSubject,
            weeklyHours: hours,
            targetGrades: editTargetGrades,
          },
        }));
      }

      await Promise.all(promises);
      await refreshTeacherNames();
      setEditingTeacher(null);
      resetEditState();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('저장에 실패했습니다.');
    }
    setSaving(false);
  };

  const resetEditState = () => {
    setEditName('');
    setEditSubject('');
    setEditHours('');
    setEditTargetGrades('');
  };

  const handleClose = () => {
    setEditingTeacher(null);
    resetEditState();
  };

  const getSubjectEmoji = (subject: string) => {
    const emojiMap: Record<string, string> = {
      '영어': '🌐',
      '체육': '⚽',
      '음악': '🎵',
      '도덕': '📖',
    };
    return emojiMap[subject] || '📚';
  };

  const calculateStats = () => {
    const stats: Record<string, { count: number; hours: number }> = {};
    
    TEACHERS.forEach(teacherId => {
      const info = getTeacherInfo(teacherId);
      if (!stats[info.subject]) {
        stats[info.subject] = { count: 0, hours: 0 };
      }
      stats[info.subject].count++;
      stats[info.subject].hours += info.weeklyHours;
    });
    
    return stats;
  };

  const stats = calculateStats();
  const totalHours = Object.values(stats).reduce((sum, s) => sum + s.hours, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">👥 전담교사 관리</h1>
          <p className="text-gray-600 mt-1">전담교사 정보를 확인하고 관리하세요</p>
        </div>
        <Button onClick={loadData} variant="secondary" size="sm">
          🔄 새로고침
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">👥</div>
            <p className="font-bold">교사 정보 로딩 중...</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEACHERS.map((teacherId) => {
            const info = getTeacherInfo(teacherId);
            const bgColor = SUBJECT_BG_COLORS[info.subject] || 'bg-gray-200';
            const realName = realNames[teacherId];

            return (
              <Card key={teacherId} className={`${bgColor}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getSubjectEmoji(info.subject)}</span>
                    {teacherId}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">담당 과목</span>
                      <span className="neo-badge bg-white px-2 py-1 rounded font-bold">
                        {info.subject}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">주간 시수</span>
                      <span className="neo-badge bg-white px-2 py-1 rounded font-bold">
                        {info.weeklyHours}시간
                      </span>
                    </div>
                    <div className="pt-2 border-t-2 border-black/20">
                      <span className="text-sm font-medium">담당 학년</span>
                      <p className="text-sm mt-1 font-semibold">{info.targetGrades}</p>
                    </div>
                    <div className="pt-2 border-t-2 border-black/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">교사명</span>
                        {user?.isAdmin && (
                          <button
                            onClick={() => handleEditClick(teacherId)}
                            className="text-xs px-2 py-0.5 bg-white/80 rounded border border-black/30 hover:bg-white"
                          >
                            ✏️ 수정
                          </button>
                        )}
                      </div>
                      {realName ? (
                        <p className="font-bold text-lg">{realName}</p>
                      ) : (
                        <p className="text-sm text-gray-600 italic">
                          (미설정)
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>📊 전담교사 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SPECIALIST_SUBJECTS.map(subject => {
              const subjectStats = stats[subject] || { count: 0, hours: 0 };
              const bgColorMap: Record<string, string> = {
                '영어': 'bg-yellow-100',
                '체육': 'bg-green-100',
                '음악': 'bg-pink-100',
                '도덕': 'bg-purple-100',
              };
              return (
                <div key={subject} className={`text-center p-4 ${bgColorMap[subject]} rounded-xl border-3 border-black`}>
                  <div className="text-3xl font-extrabold">{subjectStats.count}</div>
                  <div className="text-sm font-medium">{subject} 전담</div>
                  <div className="text-xs text-gray-600">{subjectStats.hours}시간/주</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded-xl border-3 border-black text-center">
            <div className="text-4xl font-extrabold">{totalHours}</div>
            <div className="text-sm font-medium">총 주간 전담 시수</div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={editingTeacher !== null}
        onClose={handleClose}
        title={`${editingTeacher} 정보 수정`}
      >
        <div className="space-y-4">
          <Input
            label="교사 실명"
            placeholder="예: 홍길동"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
          <Select
            label="담당 과목"
            value={editSubject}
            onChange={(e) => setEditSubject(e.target.value)}
            options={SPECIALIST_SUBJECTS.map(s => ({ value: s, label: s }))}
          />
          <Input
            label="주간 시수"
            type="number"
            placeholder="예: 20"
            value={editHours}
            onChange={(e) => setEditHours(e.target.value)}
          />
          <Input
            label="담당 학년"
            placeholder="예: 5학년, 3-6반"
            value={editTargetGrades}
            onChange={(e) => setEditTargetGrades(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="secondary">
              취소
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
