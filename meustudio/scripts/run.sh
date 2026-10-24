#!/usr/bin/env zsh
# B9 — Inicia o Meu Studio (macOS/zsh)
set -euo pipefail

cd "$(dirname "$0")/.."   # meustudio/

# Verifica .env
if [[ ! -f .env ]]; then
  echo "ERRO: arquivo .env não encontrado em $(pwd)"
  echo "       Copie .env.example para .env e preencha GEMINI_API_KEY."
  exit 1
fi

# Activa .venv (cria se ausente)
if [[ ! -d .venv ]]; then
  echo "Criando ambiente virtual..."
  python3 -m venv .venv
fi
source .venv/bin/activate

# Instala/actualiza dependências silenciosamente
pip install -q -r requirements.txt

# Verifica se a porta já está em uso por OUTRO processo
PORT="${PORT:-8000}"
PID=$(lsof -ti tcp:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
if [[ -n "$PID" ]]; then
  # Verifica se é este próprio app (main.py)
  CMD=$(ps -p "$PID" -o args= 2>/dev/null || true)
  if echo "$CMD" | grep -q "main"; then
    echo "Meu Studio já está a correr (PID $PID). Use scripts/stop.sh para parar."
    exit 0
  else
    echo "ERRO: porta $PORT ocupada por outro processo (PID $PID): $CMD"
    exit 1
  fi
fi

echo ""
echo " Meu Studio — http://localhost:${PORT}"
echo " Ctrl+C para parar."
echo ""

python main.py
