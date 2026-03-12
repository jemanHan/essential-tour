# Essential Tour - Travel Guide Web Service

React / Node.js(Fastify) 기반의 여행 정보 웹 서비스입니다.  
여행지 탐색, 일정 Planner, 좋아요 기능을 제공하며, PostgreSQL / Prisma 기반 데이터 모델과 AWS 기반 Web/WAS 분리 아키텍처를 적용해 Full Stack 프로젝트로 구현했습니다.

---

## Overview

이 프로젝트는 여행 정보 탐색과 일정 관리를 하나의 서비스에서 제공하는 것을 목표로 개발한 웹 서비스입니다.

주요 구현 범위:

- 여행지 정보 탐색
- 여행 일정 Planner
- 여행지 좋아요 기능
- 다국어 지원
- REST API 기반 데이터 처리
- AWS 기반 배포 환경 구성

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Context API / Custom Hooks
- Tailwind CSS
- DaisyUI
- Axios

### Backend

- Node.js
- Fastify
- REST API

### Database / ORM

- PostgreSQL
- Prisma ORM

### Infra

- AWS
- Nginx
- Web / WAS 분리 아키텍처
- Load Balancer
- CloudFront

---

## Main Features

- 여행 정보 조회 기능
- 여행 일정 Planner 기능
- 여행지 좋아요 기능
- 사용자 기반 데이터 관리
- 다국어 지원
- REST API 기반 클라이언트-서버 통신
- Web / WAS 분리 배포 환경 구성

---

## Project Structure

```
.
├── src/              # Frontend (React)
├── backend-src/      # Backend API (Fastify)
├── packages/
│   ├── db/           # Prisma schema & migrations
│   ├── domain/       # Domain entities
│   ├── adapters/     # External adapters (e.g. Google Places)
│   ├── application/  # Use cases
│   └── shared-types/
├── public/
├── docker-compose.yml
└── README.md
```

실제 폴더 구조는 프로젝트 정리 버전에 따라 일부 다를 수 있습니다.

---

## Architecture

이 프로젝트는 프론트엔드와 백엔드를 분리한 구조로 설계했습니다.

- **Frontend**: React 기반 사용자 화면
- **Backend**: Fastify 기반 API 서버
- **Database**: PostgreSQL + Prisma
- **Infra**: AWS 기반 Web / WAS 분리 배포

배포 환경에서는 정적 리소스와 API 서버를 분리해 서비스 접근성과 운영 안정성을 고려했습니다.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

(모노레포 구성에 따라 루트, `backend-src`, `src` 등에서 각각 설치가 필요할 수 있습니다.)

### 2. Set environment variables

프로젝트 실행 전 환경 변수 파일을 설정해야 합니다.

예시:

```env
TOUR_API_KEY=your_tour_api_key
DATABASE_URL=your_database_url
```

- Tour API 키 및 DB 연결 정보는 `packages/db/prisma/.env.example` 파일을 참고해 설정할 수 있습니다.

### 3. Run project

실행 명령은 프로젝트 구성에 따라 다릅니다.  
필요한 경우 frontend / backend / database 패키지를 각각 실행해야 합니다.

예시:

```bash
npm run dev
```

또는 패키지별 실행:

```bash
npm run dev:frontend
npm run dev:backend
```

실제 실행 명령은 각 디렉터리의 `package.json` 기준으로 조정해 주세요.  
자세한 절차는 `LOCAL_EXECUTION_GUIDE.md`를 참고할 수 있습니다.

---

## My Role

- React 기반 핵심 페이지 구현
- Node.js(Fastify) 기반 도메인 API 구현
- PostgreSQL / Prisma 기반 사용자·좋아요·여행 일정 데이터 모델 설계 및 REST API 구현
- 여행 일정 Planner 및 좋아요 기능 구현
- API 스펙 및 도메인 모델 정의
- 공통 컴포넌트 / 라우팅 / 상태관리 패턴 설계
- AWS 기반 Web / WAS 분리 인프라 설계 및 배포
- 팀장으로서 일정 조율, 업무 배분, 코드리뷰 프로세스 정리

---

## Notes

This repository is a portfolio-ready public version of the project.  
Sensitive values such as API keys, database credentials, and deployment-specific settings have been removed or replaced with example values.
