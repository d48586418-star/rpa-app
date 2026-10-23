#!/bin/bash
set -e

echo "🎬 Meu Studio — iniciando..."
echo ""

# Instala dependências se necessário
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Instalando dependências..."
    pip install -r requirements.txt --break-system-packages
fi

echo "✅ Dependências OK"
echo "🚀 Servidor rodando em http://localhost:8000"
echo "   Pressione Ctrl+C para parar."
echo ""

python main.py
