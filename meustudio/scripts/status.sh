#!/usr/bin/env zsh
# B9 — Estado do Meu Studio (macOS/zsh)
set -euo pipefail

PORT="${PORT:-8000}"
PID=$(lsof -ti tcp:"$PORT" -sTCP:LISTEN 2>/dev/null || true)

if [[ -n "$PID" ]]; then
  echo "SERVIDOR: A CORRER  (PID $PID, porta $PORT)"
  echo "URL: http://localhost:${PORT}"
else
  echo "SERVIDOR: PARADO  (porta $PORT livre)"
fi

LOG="$(dirname "$0")/../data/logs/app.log"
if [[ -f "$LOG" ]]; then
  echo ""
  echo "── Últimas 30 linhas de app.log ──────────────────────────────"
  tail -30 "$LOG"
else
  echo ""
  echo "(log ainda não existe; inicie o servidor primeiro)"
fi
