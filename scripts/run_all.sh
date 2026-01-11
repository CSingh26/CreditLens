#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "Running backend tests..."
(cd services/api && pytest)

echo "Running frontend checks..."
pnpm --filter web lint
pnpm --filter web typecheck

echo "All tests passed. Starting services..."

cd "$ROOT_DIR/services/api"
python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
API_PID=$!

cd "$ROOT_DIR/apps/web"
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8000" pnpm dev -- --hostname 127.0.0.1 --port 3000 &
WEB_PID=$!

trap 'kill "$API_PID" "$WEB_PID" 2>/dev/null' INT TERM EXIT

echo "API running at http://127.0.0.1:8000"
echo "Web running at http://127.0.0.1:3000"

wait
