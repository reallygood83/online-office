'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export default function AdminUsersPage() {
  const mockUsers = [
    { uid: '1', displayName: '김선생', email: 'kim@school.go.kr', role: 'admin', isAdmin: true },
    { uid: '2', displayName: '이선생', email: 'lee@school.go.kr', role: 'teacher', isAdmin: false },
    { uid: '3', displayName: '박선생', email: 'park@school.go.kr', role: 'teacher', isAdmin: false },
  ];

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
              <div className="text-3xl font-extrabold">{mockUsers.length}</div>
              <div className="text-sm font-medium">전체 사용자</div>
            </div>
            <div className="text-center p-4 bg-[#FF6B6B]/20 rounded-xl border-3 border-black">
              <div className="text-3xl font-extrabold">{mockUsers.filter(u => u.isAdmin).length}</div>
              <div className="text-sm font-medium">관리자</div>
            </div>
            <div className="text-center p-4 bg-[#4ECDC4]/20 rounded-xl border-3 border-black">
              <div className="text-3xl font-extrabold">{mockUsers.filter(u => !u.isAdmin).length}</div>
              <div className="text-sm font-medium">일반 교사</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>👥 사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="neo-table w-full">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>권한</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.uid}>
                    <td className="font-bold">{user.displayName}</td>
                    <td>{user.email}</td>
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
                    <td>
                      <button className="neo-button px-3 py-1 bg-white rounded text-sm font-bold">
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-gray-600">
            <p className="text-sm">
              실제 사용자 데이터는 Firebase 연동 후 표시됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
