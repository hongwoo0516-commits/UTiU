# UTiU

배운 내용을 기록하고 공개 포트폴리오로 보여 주는 Next.js 프로젝트입니다. 기존 `Documents/wss-2026/my-app` 프로젝트는 참고만 했으며, 이 프로젝트의 소스·설정·데이터베이스는 따로 관리합니다.

## 실행하기

Node.js 22.12 이상이 필요합니다. 이 작업 환경에서는 Node.js 24로 확인했습니다.

```powershell
cd C:\Users\youngwoo-best\Desktop\UTiU
npm.cmd install
npm.cmd run dev
```

브라우저에서 **http://localhost:3000**을 열면 바로 로그인 화면으로 이동합니다. 로그인 폼 아래의 **회원가입** 링크로 계정을 만들 수 있습니다. 이미 로그인한 경우에는 내 학습 기록 화면으로 이동합니다. 로그아웃하면 다시 로그인 화면이 열립니다. Windows PowerShell의 실행 정책 때문에 `npm`이 차단된다면 위처럼 `npm.cmd`를 사용하면 됩니다. 시스템 실행 정책은 변경할 필요가 없습니다.

현재 `.env.local`에는 참고 프로젝트의 MongoDB 연결 주소와 **새로 생성한 인증 시크릿**을 설정했습니다. 주소를 출력하거나 README에 복사하지 않았습니다. `MONGODB_DB_NAME=utiu`를 명시해서 URI에 들어 있는 기존 데이터베이스 이름보다 우선하도록 했습니다. 기존 계정과 학습 자료는 가져오지 않습니다.

다른 컴퓨터에서 실행할 때는 `.env.example`을 `.env.local`로 복사하고 `MONGODB_URI`와 `AUTH_SECRET`을 설정하세요. 또는 `.env.local`이 없는 상태에서 다음 명령을 실행하면 로컬 MongoDB 주소와 새 인증 시크릿을 생성합니다.

```powershell
npm.cmd run env:setup
```

MongoDB Atlas에서는 데이터베이스 사용자에게 `utiu`에 대한 읽기·쓰기 권한을 부여하고, Network Access에서 실행할 컴퓨터의 IP를 허용해야 합니다. 연결 상태는 다음 명령으로 확인할 수 있습니다. 이 명령은 데이터를 변경하지 않습니다.

```powershell
npm.cmd run db:check
```

## 들어 있는 기능

- 이름, 이메일, 비밀번호, 비밀번호 확인을 사용하는 회원가입과 가입 후 자동 로그인
- 이메일 로그인, 로그아웃, 인증이 필요한 개인 화면
- 이메일 중복 방지용 MongoDB 고유 인덱스, bcrypt 비밀번호 해시, 서버 입력 검증
- MongoDB에 저장되는 이메일별 인증 시도 제한: 로그인 15분에 10회, 가입 1시간에 5회
- 학습 기록 작성·수정·삭제: 제목, 분야, 내용, 날짜, 관련 링크, 공개 여부
- 내 기록의 전체·공개·비공개 개수와 이름·소개 수정
- `/portfolio/사용자ID`로 공유하는 개인 포트폴리오와 링크 복사
- 비공개 기록은 공개 페이지에서 제외하며, 다른 사람의 기록 수정·삭제를 서버에서 차단
- 모바일에 맞춰 조정되는 기본 화면과 폼 오류·저장 중 상태 표시
- 게시판에서 일반 글·공지 작성, 목록·상세 조회, 글 종류별 필터와 페이지 이동
- 글과 공지는 로그인한 회원이 작성하며, 본인 글만 수정·삭제 가능
- 부드러운 파란색 기본 스타일, 제목 로고를 제거한 메뉴, 로그인 폼만 표시하는 로그인 화면

학습 기록은 기본 **비공개**입니다. 기록 폼에서 “포트폴리오에 공개하기”를 선택한 기록만 공유 페이지에 나타납니다. 이름과 한 줄 소개는 공개 포트폴리오에 표시되며, 이메일과 비밀번호 해시는 공개되지 않습니다.

일반 글과 공지는 상단 **게시판** 메뉴에서 작성합니다. 게시판에는 **글쓰기**와 **공지쓰기** 버튼이 있으며, 제목·내용을 입력하면 MongoDB `posts` 컬렉션에 저장됩니다. 작성자는 로그인한 회원의 이름으로 자동 설정됩니다. 게시판의 글·공지는 누구나 읽을 수 있고, 공지는 목록 상단에 표시됩니다. 현재는 로그인한 회원 누구나 공지를 작성할 수 있는 학습용 구성입니다.

현재 범위에는 이메일 인증, 비밀번호 재설정, 소셜 로그인은 포함하지 않았습니다. 서비스 방향과 디자인이 정해지면 이 기반 위에 추가할 수 있습니다. 회원 인증 라이브러리는 참고 프로젝트와 같은 Auth.js v5 베타를 사용합니다.

## 파일을 보면서 공부하기

| 위치 | 역할 |
| --- | --- |
| `app/page.tsx` | 첫 접속 시 로그인 여부에 따라 로그인·내 학습 기록 화면으로 이동 |
| `app/register/`, `app/login/` | 회원가입·로그인 페이지 |
| `components/auth-form.tsx` | 입력 폼, 비밀번호 표시, 오류·대기 상태 |
| `app/actions/auth.ts` | 회원가입 검증, 비밀번호 해시 생성, 로그인·로그아웃 |
| `auth.ts` | Auth.js Credentials 인증과 세션 설정 |
| `lib/mongodb.ts` | MongoDB 연결 재사용과 데이터베이스 선택 |
| `models/User.ts` | 회원 스키마와 이메일 고유 인덱스 |
| `models/Learning.ts` | 회원별 학습 기록 스키마 |
| `lib/validation.ts` | 서버에서 사용하는 입력 검증 규칙 |
| `lib/data.ts` | 로그인 확인, 내 기록 조회, 공개 포트폴리오 조회 |
| `app/dashboard/` | 내 기록 목록, 작성·수정 화면 |
| `app/actions/learning.ts` | 세션에서 소유자를 확인한 뒤 기록·프로필 저장 |
| `app/portfolio/[id]/page.tsx` | 공개한 학습 기록만 보여 주는 포트폴리오 |
| `app/globals.css` | 임시 기본 디자인과 반응형 스타일 |
| `components/page-shell.tsx` | 로그인 화면에서는 상·하단 메뉴를 제외하는 화면 구성 |
| `app/posts/` | 게시판, 글쓰기·공지쓰기, 상세·수정 화면 |
| `models/Post.ts` | 회원별 게시글·공지 스키마 |
| `app/actions/posts.ts` | 작성자 인증·소유권 확인과 게시글 저장·삭제 |

회원가입 흐름: `AuthForm → registerAction → 서버 검증 → MongoDB User 생성 → Auth.js 로그인 → /dashboard`.

기록 저장 흐름: `LearningForm → saveLearningAction → 로그인 및 소유자 확인 → 서버 검증 → MongoDB 저장 → 목록과 포트폴리오 갱신`.

디자인을 바꿀 때는 `app/globals.css` 상단의 색상 변수부터 수정하세요. 화면은 `components/`에 나누어 두었기 때문에 인증 로직과 별도로 레이아웃을 바꿀 수 있습니다. 별도의 소개 홈페이지는 없으며, 실제 회원 기록은 개인 화면과 공개 페이지에서 조회합니다.

## 검사하기

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
npm.cmd run test:e2e
```

`test:e2e`는 먼저 만들어 둔 프로덕션 빌드를 3100번 포트에서 실행하고 설치된 Google Chrome을 사용합니다. MongoDB 접근 권한과 Chrome이 필요합니다. 매번 무작위 이름의 **새 `utiu_e2e_*` 데이터베이스**를 사용해 회원가입, 중복 이메일, 로그인·로그아웃, 기록 작성·수정·삭제, 공개 범위, 게시글·공지 등록과 수정·삭제, 타인 접근 차단을 검증하고 종료 시 그 테스트 데이터베이스만 정리합니다. 로그인 화면과 게시판의 모바일 너비도 확인합니다. 테스트를 강제 종료하면 임시 데이터베이스가 남을 수 있습니다. 화면 확인용 이미지는 `artifacts/screenshots/`에 저장합니다.

프로덕션 모드로 로컬 실행하려면 다음 명령을 사용하세요.

```powershell
npm.cmd run build
npm.cmd run start
```

로컬에서 다른 주소로 실행할 때는 `.env.local`의 `AUTH_URL`을 해당 주소로 바꾸세요. 서버에서 MongoDB 연결 정보를 사용하므로 정적 HTML만 내보내는 방식으로는 회원 기능이 실행되지 않습니다. `.env.local`은 Git과 Vercel 소스 업로드에서 제외됩니다.

## GitHub · Vercel

- 비공개 저장소: https://github.com/hongwoo0516-commits/UTiU
- Vercel 프로젝트: https://vercel.com/youngwoos-projects-c9a23487/utiu
- `main` 브랜치에 push하면 Vercel에서 프로덕션 배포를 진행합니다.
- Vercel의 Production과 Preview 환경에 `MONGODB_URI`, `MONGODB_DB_NAME=utiu`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`를 설정해야 합니다. 비밀값은 저장소에 추가하지 마세요.
- Vercel에서는 배포 호스트를 자동 감지하므로 로컬용 `AUTH_URL=http://localhost:3000`을 등록하지 마세요.

구현에 참고한 공식 문서: [Next.js 인증](https://nextjs.org/docs/app/guides/authentication), [Auth.js Credentials](https://authjs.dev/getting-started/providers/credentials), [Mongoose 연결](https://mongoosejs.com/docs/connections.html).
