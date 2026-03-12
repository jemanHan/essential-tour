#!/bin/bash
echo "🛑 모든 개발자 환경 안전하게 종료..."

# 함수: PID 파일로 안전하게 프로세스 종료
safe_kill() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "  ⏹️  $service_name (PID: $pid) 종료 중..."
            kill "$pid" 2>/dev/null
            sleep 2
            # 여전히 살아있으면 강제 종료
            if kill -0 "$pid" 2>/dev/null; then
                echo "  🔥 $service_name 강제 종료..."
                kill -9 "$pid" 2>/dev/null
            fi
            echo "  ✅ $service_name 종료됨"
        else
            echo "  ⚠️  $service_name 이미 종료됨"
        fi
        rm -f "$pid_file"
    else
        echo "  ⚠️  $service_name PID 파일 없음"
    fi
}

echo "🔥 개발자1 환경 종료..."
safe_kill "/tmp/dev1-backend.pid" "개발자1 백엔드"
safe_kill "/tmp/dev1-frontend.pid" "개발자1 프론트엔드"
safe_kill "/tmp/dev1-prisma.pid" "개발자1 Prisma Studio"

echo "🔥 개발자2 환경 종료..."
safe_kill "/tmp/dev2-backend.pid" "개발자2 백엔드"
safe_kill "/tmp/dev2-frontend.pid" "개발자2 프론트엔드"
safe_kill "/tmp/dev2-prisma.pid" "개발자2 Prisma Studio"

echo "🔥 개발자3 환경 종료..."
safe_kill "/tmp/dev3-backend.pid" "개발자3 백엔드"
safe_kill "/tmp/dev3-frontend.pid" "개발자3 프론트엔드"
safe_kill "/tmp/dev3-prisma.pid" "개발자3 Prisma Studio"

# 혹시 남아있는 포트들 정리 (더 정확하게)
echo "🧹 포트별 정리..."
for port in 3002 3003 3004 5174 5175 5176 5555 5556 5557; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "  🔥 포트 $port 정리 (PID: $pid)..."
        kill "$pid" 2>/dev/null
        sleep 1
        # 여전히 살아있으면 강제 종료
        if kill -0 "$pid" 2>/dev/null; then
            kill -9 "$pid" 2>/dev/null
        fi
    fi
done

echo "✅ 모든 개발자 환경이 안전하게 종료되었습니다!"
echo "🌐 SSH 연결과 WAS 서버는 영향받지 않습니다."