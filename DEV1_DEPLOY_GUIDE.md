# 배포 가이드 (Placeholder)

실제 서버 IP, PEM 경로, 계정 정보는 **절대 이 문서에 넣지 마세요.**  
로컬/배포 시에는 환경변수 또는 별도 비공개 설정을 사용하세요.

---

## 개발 환경 기동 절차 (예시)

1) 개발 환경 종료(선택)
```bash
bash stop-all-dev.sh
```

2) 개발 환경 시작
```bash
bash start-dev1.sh
```

- 결과(기본 포트 예시)
  - 백엔드: http://localhost:3002
  - 프론트엔드: http://localhost:5174
  - Prisma Studio: http://localhost:5555

---

## 프론트엔드 빌드 및 웹서버(Nginx) 배포 절차 (예시)

1) 변수 정의 (실제 값은 배포 환경에 맞게 설정, 이 문서에는 넣지 말 것)
```bash
export WEB_HOST=your-server-ip
export PEM_PATH=/path/to/your-key.pem
export NGINX_ROOT=/usr/share/nginx/html/your-app
```

2) 빌드
```bash
cd apps/frontend  # 또는 프로젝트의 프론트 경로
npm ci
npm run build
```

3) rsync 동기화 예시
```bash
rsync -az --delete -e "ssh -i $PEM_PATH" \
  dist/ \
  your-user@$WEB_HOST:$NGINX_ROOT/
```

4) 원격 서버에서 Nginx 재시작
```bash
ssh -i $PEM_PATH your-user@$WEB_HOST "sudo nginx -t && sudo systemctl reload nginx"
```

---

## CloudFront 배포 (선택)

```bash
export CF_DIST_ID=your_cloudfront_distribution_id
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/index.html" "/assets/*"
```

---

## 문제 해결 체크리스트

- 빌드 실패: Node 버전/의존성 확인(`npm ci`), 환경 변수(.env) 누락 여부 확인
- Nginx 403/404: `NGINX_ROOT` 경로, 권한 확인
- API CORS: 프런트는 백엔드 프록시(`/api`) 또는 동일 도메인 사용 권장

---

**주의**: 실제 서버 IP, PEM 경로, DB 비밀번호, API 키 등은 이 파일에 기록하지 말고, 환경변수 또는 비공개 설정으로만 관리하세요.
