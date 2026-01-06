'use client';

import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

export default function AdminAdminsPage() {
  const currentAdmins = [
    { uid: '1', displayName: '김선생', email: 'kim@school.go.kr' },
  ];

  const eligibleUsers = [
    { uid: '2', displayName: '이선생', email: 'lee@school.go.kr' },
    { uid: '3', displayName: '박선생', email: 'park@school.go.kr' },
  ];

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
          <CardTitle>✅ 현재 관리자</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentAdmins.map((admin) => (
              <div
                key={admin.uid}
                className="flex items-center justify-between p-4 bg-[#FF6B6B]/10 rounded-xl border-3 border-[#FF6B6B]"
              >
                <div>
                  <div className="font-bold">{admin.displayName}</div>
                  <div className="text-sm text-gray-600">{admin.email}</div>
                </div>
                <Button variant="danger" size="sm">
                  권한 해제
                </Button>
              </div>
            ))}
            {currentAdmins.length === 0 && (
              <p className="text-center text-gray-500 py-4">등록된 관리자가 없습니다.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>👥 관리자 지정 가능 사용자</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eligibleUsers.map((user) => (
              <div
                key={user.uid}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-3 border-gray-200"
              >
                <div>
                  <div className="font-bold">{user.displayName}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <Button variant="accent" size="sm">
                  관리자 지정
                </Button>
              </div>
            ))}
            {eligibleUsers.length === 0 && (
              <p className="text-center text-gray-500 py-4">지정 가능한 사용자가 없습니다.</p>
            )}
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
