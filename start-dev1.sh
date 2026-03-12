#!/bin/bash
# 로컬/개발 환경 시작 스크립트 (placeholder)
# DATABASE_URL, 프로젝트 경로는 환경에 맞게 설정하세요. 실제 비밀값은 넣지 마세요.

echo "🚀 개발 환경 시작..."
echo "포트: 백엔드 3002, 프론트엔드 5174, Prisma Studio 5555, DB 5432"

# 환경변수 예시 (실제 값은 .env 또는 export로 설정)
# export DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_db?schema=public"

# 백엔드 시작 (백그라운드) — 경로를 프로젝트 루트로 변경
cd "$(dirname "$0")/backend-src" || exit 1
npm run dev &
BACKEND_PID=$!

# 프론트엔드 시작 (백그라운드) — 경로를 프로젝트 루트로 변경
cd "$(dirname "$0")" || exit 1
# npm run dev (프론트 루트에 따라 경로 조정)
# npm run dev:fe &
# FRONTEND_PID=$!

# Prisma Studio (선택) — DATABASE_URL 필요
# DATABASE_URL="${DATABASE_URL}" npx prisma studio --port 5555 --schema packages/db/prisma/schema.prisma &
# PRISMA_PID=$!

echo "✅ 백엔드 실행 중 (PID: $BACKEND_PID)"
echo "백엔드: http://localhost:3002"
echo "DATABASE_URL를 설정한 뒤 Prisma Studio 등은 별도 터미널에서 실행하세요."
