#!/usr/bin/env zsh
# B9 — Smoke test do Meu Studio (macOS/zsh)
# Uso: ./scripts/smoke.sh          (sem chamada à IA)
#      ./scripts/smoke.sh --ai     (faz uma chamada real à IA)
set -euo pipefail

cd "$(dirname "$0")/.."   # meustudio/

PASS=0
FAIL=0
TEST_AI=0
[[ "${1:-}" == "--ai" ]] && TEST_AI=1

ok()   { echo "  PASSOU: $1"; (( PASS++ )) || true; }
fail() { echo "  FALHOU: $1 — $2"; (( FAIL++ )) || true; }

echo ""
echo "═══════════════════════════════════════"
echo " Smoke test — Meu Studio"
echo "═══════════════════════════════════════"

# 1 — Sintaxe Python
echo ""
echo "1. Sintaxe Python..."
if python3 -m py_compile main.py 2>/dev/null; then
  ok "main.py compila sem erros"
else
  fail "main.py" "erro de sintaxe"
fi

for mod in config.py migrations.py ai.py; do
  if [[ -f "$mod" ]]; then
    if python3 -m py_compile "$mod" 2>/dev/null; then
      ok "$mod compila"
    else
      fail "$mod" "erro de sintaxe"
    fi
  fi
done

# 2 — Servidor respondendo
echo ""
echo "2. Endpoints HTTP..."
PORT="${PORT:-8000}"
BASE="http://localhost:${PORT}"

check_get() {
  local url="$1" label="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
  if [[ "$status" == "200" ]]; then
    ok "GET $label → 200"
  else
    fail "GET $label" "HTTP $status (servidor a correr?)"
  fi
}

check_get "$BASE/api/status"   "/api/status"
check_get "$BASE/api/profile"  "/api/profile"
check_get "$BASE/api/projects" "/api/projects"
check_get "$BASE/api/events"   "/api/events"

# 3 — Chamada real à IA (só com --ai)
if (( TEST_AI )); then
  echo ""
  echo "3. Chamada real à IA..."
  RESP=$(curl -s -X POST "$BASE/api/ai/chat" \
    -H "Content-Type: application/json" \
    -d '{"message":"responda só com a palavra TESTE","session_id":"smoke"}' \
    --max-time 30 2>/dev/null || echo "ERRO")
  if echo "$RESP" | grep -qi "reply"; then
    ok "POST /api/ai/chat → resposta recebida"
  else
    fail "POST /api/ai/chat" "$RESP"
  fi
else
  echo ""
  echo "3. Chamada à IA ignorada (use --ai para activar)."
fi

# Resultado
echo ""
echo "═══════════════════════════════════════"
echo " Resultado: ${PASS} passaram  |  ${FAIL} falharam"
echo "═══════════════════════════════════════"
echo ""
(( FAIL == 0 ))
