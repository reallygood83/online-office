'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { getAllUsers, updateUserRole } from '@/lib/firebase/firestore';
import { User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      console.log('Fetched users:', fetchedUsers);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  const handleToggleRole = async (user: User) => {
    if (!confirm(`${user.displayName}님의 권한을 ${user.isAdmin ? '교사' : '관리자'}로 변경하시겠습니까?`)) {
      return;
    }

    setUpdating(user.uid);
    try {
      await updateUserRole(user.uid, !user.isAdmin);
      await loadUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('권한 변경에 실패했습니다.');
    }
    setUpdating(null);
  };

  const adminCount = users.filter(u => u.isAdmin).length;
  const teacherCount = users.filter(u => !u.isAdmin).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👤</div>
          <p className="font-bold">사용자 목록 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">👤 사용자 관리</h1>
        <p className="text-gray-600 mt-1">등록된 사용자를 관리합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📊 사용자 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-[#FFE135]/20 rounded-xl border-3 border-black">
              <div className="text-3xl font-extrabold">{users.length}</div>
              <div className="text-sm font-medium">전체 사용자</div>
            </div>
            <div className="text-center p-4 bg-[#FF6B6B]/20 rounded-xl border-3 border-black">
              <div className="text-3xl font-extrabold">{adminCount}</div>
              <div className="text-sm font-medium">관리자</div>
            </div>
            <div className="text-center p-4 bg-[#4ECDC4]/20 rounded-xl border-3 border-black">
              <div className="text-3xl font-extrabold">{teacherCount}</div>
              <div className="text-sm font-medium">일반 교사</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>👥 사용자 목록</CardTitle>
            <Button onClick={loadUsers} variant="secondary" size="sm">
              🔄 새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500">등록된 사용자가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">
                회원가입을 통해 사용자가 등록되면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="neo-table w-full">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>권한</th>
                    <th>가입일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid}>
                      <td className="font-bold">{user.displayName || '(이름 없음)'}</td>
                      <td className="text-sm">{user.email || '(이메일 없음)'}</td>
                      <td>
                        {user.isAdmin ? (
                          <span className="neo-badge bg-[#FF6B6B] text-white px-2 py-1 rounded">
                            관리자
                          </span>
                        ) : (
                          <span className="neo-badge bg-[#4ECDC4] px-2 py-1 rounded">
                            교사
                          </span>
                        )}
                      </td>
                      <td className="text-sm text-gray-600">
                        {((user.createdAt as any)?.toDate
                          ? (user.createdAt as any).toDate().toLocaleDateString('ko-KR')
                          : new Date(user.createdAt).toLocaleDateString('ko-KR')) || '-'}
                      </td>
                      <td>
                        <Button
                          onClick={() => handleToggleRole(user)}
                          disabled={updating === user.uid}
                          size="sm"
                          variant={user.isAdmin ? 'danger' : 'accent'}
                        >
                          {updating === user.uid
                            ? '처리중...'
                            : user.isAdmin
                              ? '권한 해제'
                              : '관리자 지정'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
