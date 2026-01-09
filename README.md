# 🏫 박달초등학교 교직원 포털

> 전담교사 시간표 관리 및 교무 업무 지원 웹 애플리케이션

## 📋 프로젝트 개요

박달초등학교 교직원을 위한 통합 시간표 관리 시스템입니다.

### 주요 기능
- **시간표 관리**: 전담교사별/학급별 시간표 조회 및 수정
- **담임 관리**: 학급별 담임교사 정보 관리
- **인증 시스템**: Firebase 기반 회원가입/로그인 (특별코드 인증)
- **관리자 대시보드**: 복수 관리자 지원, 시스템 전체 관리

### 기술 스택
| 구분 | 기술 |
|------|------|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | Firebase (Firestore, Auth) |
| 스타일링 | Tailwind CSS 4, Neo-Brutalism |
| 배포 | Vercel |

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일을 열고 Firebase 설정값을 입력하세요.

### 3. 개발 서버 실행
```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 4. Firebase 데이터 초기화
1. 관리자 계정으로 로그인
2. 관리자 > 시스템 설정 이동
3. "데이터 초기화 실행" 버튼 클릭

## 🔐 보안 안내

### ⚠️ 중요: 환경변수 관리

**절대 커밋하지 마세요:**
- `.env.local` - Firebase API 키 및 설정 포함
- 기타 `.env*` 파일들

**안전하게 포함됨:**
- `.env.example` - 플레이스홀더 값만 포함

### Firebase 보안 규칙

Firestore 콘솔에서 아래 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }

    match /schedules/{doc} { allow read, write: if isAuthenticated(); }
    match /classSchedules/{doc} { allow read, write: if isAuthenticated(); }
    match /teacherSchedules/{doc} { allow read, write: if isAuthenticated(); }
    match /teacherNames/{doc} { allow read: if isAuthenticated(); allow write: if isAdmin(); }
    match /classHomeTeachers/{doc} { allow read: if isAuthenticated(); allow write: if isAdmin(); }
    match /settings/{doc} { allow read: if isAuthenticated(); allow write: if isAdmin(); }
  }
}
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (protected)/        # 인증 필요 페이지
│   │   ├── dashboard/      # 대시보드
│   │   ├── schedule/       # 시간표 (teacher, class)
│   │   ├── teachers/       # 전담교사 관리
│   │   └── classes/        # 학급/담임 관리
│   ├── admin/              # 관리자 전용
│   ├── login/              # 로그인
│   └── signup/             # 회원가입
├── components/             # 재사용 컴포넌트
│   ├── ui/                 # Neo-Brutalism UI
│   ├── auth/               # 인증 관련
│   ├── layout/             # 레이아웃
│   └── schedule/           # 시간표 컴포넌트
├── lib/
│   ├── firebase/           # Firebase 설정 및 서비스
│   └── hooks/              # 커스텀 훅
├── types/                  # TypeScript 타입
└── data/                   # 시간표 데이터
```

## 🎨 디자인 시스템

Neo-Brutalism 스타일 적용:
- 두꺼운 검정 테두리 (3-4px)
- 하드 섀도우 (4-8px offset)
- 밝고 대담한 색상
- 높은 대비

## 📝 특별코드

회원가입 시 필요한 특별코드: `20261234`

(관리자 페이지에서 변경 가능)

## 🚀 배포

### Vercel 배포
1. GitHub 저장소 연결
2. 환경변수 설정 (Settings > Environment Variables)
3. 자동 배포 완료

### 환경변수 (Vercel)
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=xxx
```

## 📄 라이선스

© 2026 박달초등학교 교직원 포털
