'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal } from '@/components/ui';
import { TEACHERS, TEACHER_INFO, SUBJECT_BG_COLORS } from '@/data/scheduleData';
import { getTeacherRealNames, updateTeacherRealName } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';

export default function TeachersPage() {
  const { user } = useAuth();
  const [realNames, setRealNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRealNames();
  }, []);

  const loadRealNames = async () => {
    setLoading(true);
    const names = await getTeacherRealNames();
    setRealNames(names);
    setLoading(false);
  };

  const handleEditClick = (teacherId: string) => {
    setEditingTeacher(teacherId);
    setEditName(realNames[teacherId] || '');
  };

  const handleSave = async () => {
    if (!editingTeacher) return;

    setSaving(true);
    try {
      await updateTeacherRealName(editingTeacher, editName.trim());
      setRealNames(prev => ({ ...prev, [editingTeacher]: editName.trim() }));
      setEditingTeacher(null);
      setEditName('');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('저장에 실패했습니다.');
    }
    setSaving(false);
  };

  const handleClose = () => {
    setEditingTeacher(null);
    setEditName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">👥 전담교사 관리</h1>
          <p className="text-gray-600 mt-1">전담교사 정보를 확인하고 관리하세요</p>
        </div>
        <Button onClick={loadRealNames} variant="secondary" size="sm">
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
            const info = TEACHER_INFO[teacherId];
            const bgColor = SUBJECT_BG_COLORS[info.subject];
            const realName = realNames[teacherId];

            return (
              <Card key={teacherId} className={`${bgColor}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">
                      {info.subject === '영어' && '🌐'}
                      {info.subject === '체육' && '⚽'}
                      {info.subject === '음악' && '🎵'}
                      {info.subject === '도덕' && '📖'}
                    </span>
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
            <div className="text-center p-4 bg-yellow-100 rounded-xl border-3 border-black">
              <div className="text-3xl font-extrabold">3</div>
              <div className="text-sm font-medium">영어 전담</div>
              <div className="text-xs text-gray-600">60시간/주</div>
            </div>
            <div className="text-center p-4 bg-green-100 rounded-xl border-3 border-black">
              <div className="text-3xl font-extrabold">3</div>
              <div className="text-sm font-medium">체육 전담</div>
              <div className="text-xs text-gray-600">62시간/주</div>
            </div>
            <div className="text-center p-4 bg-pink-100 rounded-xl border-3 border-black">
              <div className="text-3xl font-extrabold">1</div>
              <div className="text-sm font-medium">음악 전담</div>
              <div className="text-xs text-gray-600">18시간/주</div>
            </div>
            <div className="text-center p-4 bg-purple-100 rounded-xl border-3 border-black">
              <div className="text-3xl font-extrabold">1</div>
              <div className="text-sm font-medium">도덕 전담</div>
              <div className="text-xs text-gray-600">16시간/주</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded-xl border-3 border-black text-center">
            <div className="text-4xl font-extrabold">156</div>
            <div className="text-sm font-medium">총 주간 전담 시수</div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={editingTeacher !== null}
        onClose={handleClose}
        title={`${editingTeacher} 교사명 설정`}
      >
        <div className="space-y-4">
          <Input
            label="교사 실명"
            placeholder="예: 홍길동"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="secondary">
              취소
            </Button>
            <Button onClick={handleSave} disabled={saving || !editName.trim()}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
