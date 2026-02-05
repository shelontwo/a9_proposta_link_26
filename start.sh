#!/bin/bash

echo "--- Iniciando Setup de Produção ---"

# 1. Iniciar Backend
echo "Iniciando Backend na porta 3001..."
cd /app/backend
node src/app.js &

# 2. Preparar Frontend
echo "Preparando Frontend..."
cd /app/frontend

# Deleta a pasta .next se ela existir para evitar o erro de build corrompido
if [ -d ".next" ]; then
    echo "Limpando build antigo corrompido..."
    rm -rf .next
fi

echo "Iniciando novo build do Next.js..."
npm run build

echo "Iniciando Frontend na porta 3000..."
PORT=3000 HOSTNAME=0.0.0.0 npm start &

# 3. Esperar processos (wait simples sem -n)
echo "Sistema online. Aguardando processos..."
wait