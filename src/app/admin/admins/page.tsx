'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { getAllUsers, addAdmin, removeAdmin } from '@/lib/firebase/firestore';
import { User } from '@/types';

export default function AdminAdminsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const fetchedUsers = await getAllUsers();
    setUsers(fetchedUsers);
    setLoading(false);
  };

  const currentAdmins = users.filter(u => u.isAdmin);
  const eligibleUsers = users.filter(u => !u.isAdmin);

  const handleAddAdmin = async (user: User) => {
    if (!confirm(`${user.displayName}님을 관리자로 지정하시겠습니까?`)) return;

    setProcessing(user.uid);
    try {
      await addAdmin(user.uid);
      await loadUsers();
    } catch (error) {
      console.error('Failed to add admin:', error);
      alert('관리자 지정에 실패했습니다.');
    }
    setProcessing(null);
  };

  const handleRemoveAdmin = async (user: User) => {
    if (currentAdmins.length <= 1) {
      alert('최소 1명의 관리자가 필요합니다.');
      return;
    }

    if (!confirm(`${user.displayName}님의 관리자 권한을 해제하시겠습니까?`)) return;

    setProcessing(user.uid);
    try {
      await removeAdmin(user.uid);
      await loadUsers();
    } catch (error) {
      console.error('Failed to remove admin:', error);
      alert('관리자 해제에 실패했습니다.');
    }
    setProcessing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🛡️</div>
          <p className="font-bold">관리자 목록 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">🛡️ 관리자 지정</h1>
        <p className="text-gray-600 mt-1">관리자 권한을 부여하거나 해제합니다</p>
      </div>

      <Card className="bg-[#FF6B6B]/10 border-[#FF6B6B]">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold text-lg">관리자 권한 안내</h3>
              <p className="text-sm text-gray-700 mt-1">
                관리자는 다음 권한을 가집니다:
              </p>
              <ul className="text-sm text-gray-700 mt-2 list-disc list-inside">
                <li>모든 사용자 정보 조회 및 수정</li>
                <li>시스템 설정 변경 (특별코드, 학기 설정)</li>
                <li>관리자 권한 부여/해제</li>
                <li>시간표 수정 및 관리</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>✅ 현재 관리자 ({currentAdmins.length}명)</CardTitle>
            <Button onClick={loadUsers} variant="secondary" size="sm">
              🔄 새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentAdmins.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👤</div>
                <p className="text-gray-500">등록된 관리자가 없습니다.</p>
              </div>
            ) : (
              currentAdmins.map((admin) => (
                <div
                  key={admin.uid}
                  className="flex items-center justify-between p-4 bg-[#FF6B6B]/10 rounded-xl border-3 border-[#FF6B6B]"
                >
                  <div>
                    <div className="font-bold">{admin.displayName}</div>
                    <div className="text-sm text-gray-600">{admin.email}</div>
                  </div>
                  <Button
                    onClick={() => handleRemoveAdmin(admin)}
                    disabled={processing === admin.uid || currentAdmins.length <= 1}
                    variant="danger"
                    size="sm"
                  >
                    {processing === admin.uid ? '처리중...' : '권한 해제'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>👥 관리자 지정 가능 사용자 ({eligibleUsers.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eligibleUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-500">
                  {users.length === 0
                    ? '등록된 사용자가 없습니다.'
                    : '모든 사용자가 이미 관리자입니다.'}
                </p>
              </div>
            ) : (
              eligibleUsers.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-3 border-gray-200"
                >
                  <div>
                    <div className="font-bold">{user.displayName}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <Button
                    onClick={() => handleAddAdmin(user)}
                    disabled={processing === user.uid}
                    variant="accent"
                    size="sm"
                  >
                    {processing === user.uid ? '처리중...' : '관리자 지정'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
