#!/bin/sh
# startup.sh - Script que executa antes da aplicação Next.js

set -e

echo "🚀 Iniciando MyFit..."

# Criar diretório de uploads se não existir
echo "📁 Verificando diretórios..."
mkdir -p /app/public/uploads
chmod 777 /app/public/uploads

echo "✅ Diretórios criados com sucesso"
echo "📊 Informações do sistema:"
echo "   Node: $(node --version)"
echo "   NPM: $(npm --version)"
echo "   PWD: $(pwd)"
echo "   Uploads dir: $(ls -ld /app/public/uploads)"

echo ""
echo "🎯 Iniciando Next.js em modo produção..."
echo "🌐 Acesse: http://localhost:3000"
echo ""

# Executar a aplicação Next.js
exec npm start
