# 🏠 로컬 실행 가이드 (EC2 → 로컬)

## 📋 개요
EC2 서버에서 로컬 환경으로 프로젝트를 이동할 때 필요한 설정 변경사항과 실행 방법을 정리합니다.

## ⚠️ 주요 변경사항

### 1. IP 주소 변경
- **EC2 백엔드**: `your-server-ip:3002` → `localhost:3002` 또는 `127.0.0.1:3002`
- **EC2 프론트엔드**: `your-server-ip:5174` → `localhost:5174` 또는 `127.0.0.1:5174`
- **외부 접속**: `http://your-server-ip:5174` → `http://localhost:5174`

### 2. 환경 변수 수정 필요
- API 엔드포인트 URL 변경
- CORS 설정 변경
- 데이터베이스 연결 설정 (PostgreSQL 로컬 설치 필요)

## 🔧 설정 변경 방법

### 1. 프론트엔드 설정 변경

#### `env.development` 파일 수정
```bash
# 로컬 예시
VITE_API_BASE_URL=http://localhost:3002
```

#### `env.production` 파일 수정
```bash
# 로컬 예시
VITE_API_BASE_URL=http://localhost:3002
```

### 2. 백엔드 설정 변경

#### CORS 설정 확인
백엔드 CORS 설정에 `localhost:5174` 등 로컬 origin을 포함하세요.

### 3. 데이터베이스 설정

#### PostgreSQL 로컬 설치 (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 데이터베이스 생성 (예시 — 실제 값은 로컬 환경에 맞게 설정)
```bash
sudo -u postgres psql
CREATE USER your_user WITH PASSWORD 'your_password';
CREATE DATABASE your_db OWNER your_user;
GRANT ALL PRIVILEGES ON DATABASE your_db TO your_user;
\q
```

#### 환경 변수 설정
```bash
# 백엔드 환경 변수 (예시)
export DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_db?schema=public"
```

## 🚀 로컬 실행 방법

### 1. 프로젝트 디렉터리로 이동
```bash
cd essential-tour
```

### 2. 백엔드 실행
```bash
# 백엔드 의존성 설치
cd backend-src
npm install

# 환경 변수 설정 (예시 — 실제 값은 .env 또는 export로 설정)
export DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_db?schema=public"

# 백엔드 실행
npm run dev
# 포트: http://localhost:3002
```

### 3. 프론트엔드 실행 (새 터미널)
```bash
# 프론트엔드 의존성 설치
cd src
npm install

# 환경 변수 확인/수정
# VITE_API_BASE_URL=http://localhost:3002 로 설정

# 프론트엔드 실행
npm run dev
# 포트: http://localhost:5174
```

### 4. Prisma Studio 실행 (선택사항)
```bash
# 백엔드 디렉토리에서
cd backend-src
export DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_db?schema=public"
npx prisma studio --port 5555 --schema packages/db/prisma/schema.prisma
# 포트: http://localhost:5555
```

## 🔍 문제 해결

### 1. 데이터베이스 연결 오류
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# 데이터베이스 연결 테스트 (예시 계정/DB명으로 교체)
psql -h localhost -U your_user -d your_db
```

### 2. 포트 충돌
```bash
# 포트 사용 확인
netstat -tulpn | grep :3002
netstat -tulpn | grep :5174

# 프로세스 종료
kill -9 <PID>
```

### 3. CORS 오류
- 브라우저 개발자 도구에서 CORS 오류 확인
- 백엔드 CORS 설정에서 `localhost:5174` 추가 확인

### 4. API 호출 실패
- 네트워크 탭에서 API 요청 URL 확인
- `localhost:3002`로 올바르게 요청되는지 확인

## 📝 주의사항

### 1. 환경 변수 관리
- `.env` 파일은 버전 관리에 포함하지 않기
- 로컬 환경에 맞게 환경 변수 수정 필수

### 2. 데이터베이스 마이그레이션
- Prisma 마이그레이션 실행:
```bash
npx prisma migrate dev
```

### 3. 외부 API 키
- Tour API: `TOUR_API_KEY` 환경변수 설정 (한국관광공사 API 신청)
- Google Places API 키가 로컬 도메인에서 작동하는지 확인

### 4. 파일 경로
- 이미지 파일 경로가 상대 경로로 설정되어 있는지 확인

## 🌐 접속 정보 (로컬)

- **프론트엔드**: http://localhost:5174
- **백엔드 API**: http://localhost:3002
- **Prisma Studio**: http://localhost:5555
- **데이터베이스**: localhost:5432

## 📞 추가 도움

문제가 발생하면:
1. 브라우저 개발자 도구 콘솔 확인
2. 백엔드 로그 확인
3. 데이터베이스 연결 상태 확인
4. 포트 사용 상태 확인

---

**마지막 업데이트**: 2025-03-12 (공개용 예시값으로 정리)
