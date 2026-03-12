# apps/backend/Dockerfile
FROM node:20-alpine AS development

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# Prisma generate (있다면)
RUN npx prisma generate || echo "Prisma not found, skipping generate"

EXPOSE 3002

# 개발 모드로 실행
CMD ["npm", "run", "dev"]
