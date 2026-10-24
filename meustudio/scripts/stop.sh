#!/usr/bin/env zsh
# B9 — Para o Meu Studio (macOS/zsh)
set -euo pipefail

PORT="${PORT:-8000}"
PID=$(lsof -ti tcp:"$PORT" -sTCP:LISTEN 2>/dev/null || true)

if [[ -z "$PID" ]]; then
  echo "Nenhum processo a escutar na porta $PORT."
  exit 0
fi

echo "Parando processo PID $PID (porta $PORT)..."
kill -TERM "$PID" 2>/dev/null || true

# Aguarda até 5 s
for i in 1 2 3 4 5; do
  sleep 1
  if ! lsof -ti tcp:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Servidor parado."
    exit 0
  fi
done

echo "Processo ainda activo; enviando SIGKILL..."
kill -KILL "$PID" 2>/dev/null || true
echo "Servidor forçado a parar."
