#!/bin/bash

# Mata processos antigos para evitar EADDRINUSE
fuser -k 3000/tcp
fuser -k 3001/tcp

echo "--- Iniciando Setup de Produção ---"

# 1. Iniciar Backend
echo "Iniciando Backend na porta 3001..."
cd /app/backend
node src/app.js &

# 2. Verificar e Buildar Frontend
echo "Preparando Frontend..."
cd /app/frontend

if [ ! -d ".next" ]; then
    echo "Pasta .next NÃO encontrada. Iniciando build agora..."
    npm run build
fi

echo "Iniciando Frontend na porta 3000..."
PORT=3000 HOSTNAME=0.0.0.0 npm start &

# 3. Esperar processos (Sem o -n para evitar erro de shell)
echo "Sistema online. Aguardando processos..."
wait