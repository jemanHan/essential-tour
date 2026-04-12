# Essential Tour

React / Fastify 기반으로 구축한 여행 정보 탐색 웹 서비스입니다.  
여행지 검색, 일정 Planner, 좋아요, 다국어 지원을 하나의 흐름으로 연결하고, PostgreSQL / Prisma 기반 데이터 모델과 AWS Web/WAS 분리 배포 구조까지 포함해 구현했습니다.

특히 외부 API를 많이 쓰는 여행 서비스 특성상  
검색 흐름, 데이터 가공, 일정 관리뿐 아니라 과다호출과 비용 문제를 실제로 해결하는 데 집중했습니다.

---

## Project overview

- 여행지 탐색과 일정 관리를 하나의 서비스에서 제공하는 웹 서비스
- Google Places API + Tour API 기반 장소 탐색 및 상세 조회
- 일정 Planner, 좋아요, 다국어 지원 기능 구현
- PostgreSQL / Prisma 기반 데이터 모델과 REST API 설계
- AWS 기반 Web / WAS 분리 배포 환경 구성

---

## Core features

- 여행지 탐색 및 상세 정보 조회
- 일정 Planner 기능
- 여행지 좋아요 기능
- 다국어 지원
- REST API 기반 데이터 처리
- AWS 기반 배포 환경 구성

---

## Technical decisions

- **React + Fastify**  
  클라이언트와 API 서버를 분리해 화면과 도메인 로직의 책임을 명확히 나누기 위해 선택

- **PostgreSQL + Prisma**  
  사용자, 여행지, 일정, 좋아요 데이터를 관계형 구조로 관리하기 위해 사용

- **domain / application / adapters 패키지 구조**  
  외부 API 연동과 서비스 로직이 한곳에 섞이지 않도록 책임을 분리하기 위해 적용

- **Web / WAS 분리 배포**  
  정적 자산과 API 서버를 나눠 운영 안정성과 접근성을 확보하기 위해 적용

- **Load Balancer + CloudFront**  
  서비스 접근성과 응답 안정성을 고려한 배포 구조를 만들기 위해 사용

---

## Problem solving and improvements

### 1. React `useEffect` 루프로 인한 외부 API 과다호출
- 문제: Google Places API 사용량이 급증하며 며칠 새 약 40만 원이 청구됨
- 원인: `useEffect` 의존성 오류로 같은 요청이 반복 실행됨
- 해결:
  - `useCallback` 기반으로 의존성 구조 재정리
  - 최소 500ms 요청 간격 제한
  - 요청 큐로 중복 요청 방지
  - 30초 캐시와 최대 캐시 크기 제한 적용
- 결과:
  - API 호출량 약 90% 감소
  - 일일 비용 10만 원대 이상에서 1만 원 이하 수준으로 감소

### 2. 스케줄 생성 데이터의 유효성 보장이 필요한 문제
- 문제: 일정 생성 시 날짜 / 시간 / 필수 필드 오류 가능성 존재
- 해결:
  - 날짜 형식 검증
  - 시간 형식 검증
  - 시작 / 종료 시간 범위 검증
  - 제목 필수값 검증
  - 표준 에러 응답 형식 정의
- 결과: Planner API 입력 안정성과 예외 처리 일관성 확보

### 3. 팀 단위 동시 개발 환경이 필요한 문제
- 문제: 여러 개발자가 동시에 작업할 때 포트 충돌, DB 충돌, 테스트 기준 차이가 발생
- 해결:
  - 개발자별 FE / BE / DB 포트 분리
  - 독립 DB 사용
  - Prisma generate / migrate 흐름 분리
- 결과: 3명 동시 개발환경에서도 충돌 없이 기능 검증 가능

---

## Architecture

```text
.
├── src/              # Frontend (React)
├── backend-src/      # Backend API (Fastify)
├── packages/
│   ├── db/           # Prisma schema & migrations
│   ├── domain/       # Domain entities
│   ├── adapters/     # External adapters (Google Places, etc.)
│   ├── application/  # Use cases
│   └── shared-types/
├── public/
├── docker-compose.yml
└── README.md
```

- Frontend: React 기반 사용자 화면
- Backend: Fastify 기반 API 서버
- Database: PostgreSQL + Prisma
- Package structure: `domain / application / adapters` 중심으로 책임 분리
- Infra: AWS 기반 Web / WAS 분리 배포

---

## Tech stack

- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS, DaisyUI, Axios
- Backend: Node.js, Fastify, REST API
- Database: PostgreSQL, Prisma ORM
- Infra: AWS, Nginx, Load Balancer, CloudFront

---

## My role

- React 기반 주요 페이지 구현
- Fastify 기반 도메인 API 구현
- PostgreSQL / Prisma 기반 사용자 / 좋아요 / 여행 일정 데이터 모델 설계 및 REST API 구현
- Planner 및 좋아요 기능 구현
- API 스펙 및 도메인 모델 정의
- 공통 컴포넌트 / 라우팅 / 상태관리 패턴 정리
- AWS 기반 Web / WAS 분리 인프라 설계 및 배포
- 팀장으로서 일정 조율, 업무 분배, 코드 리뷰 흐름 정리

---

## Getting started

### Install dependencies

```bash
npm install
```

### Environment variables

```env
TOUR_API_KEY=your_tour_api_key
DATABASE_URL=your_database_url
```

자세한 설정은 `packages/db/prisma/.env.example`, `LOCAL_EXECUTION_GUIDE.md`를 참고하세요.

### Run project

```bash
npm run dev
```

또는 패키지별 실행:

```bash
npm run dev:frontend
npm run dev:backend
```

---

## Related docs

- `API_과다호출_해결_가이드.md`
- `BACKEND_ADDITIONAL_CHANGES.md`
- `README-3개발자.md`
- `LOCAL_EXECUTION_GUIDE.md`
- `DEPLOYMENT_GUIDE.md`

---

## Notes

이 저장소는 포트폴리오 공개용으로 정리한 버전이며, 실행 관련 값은 환경변수 기준으로 구성합니다.
