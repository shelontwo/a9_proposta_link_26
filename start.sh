#!/bin/bash

echo "Iniciando sistema em modo PRODUÇÃO..."

# Backend
cd /app/backend
# Usar 'node src/app.js' é o ideal para produção
node src/app.js & 

sleep 5

# Frontend
cd /app/frontend
# Verificando se a pasta build existe por segurança
if [ -d ".next" ]; then
    echo "Pasta .next encontrada! Iniciando frontend na porta 3000..."
    PORT=3000 HOSTNAME=0.0.0.0 npm start
else
    echo "ERRO: Pasta .next não encontrada. O build falhou?"
    exit 1
fi

wait -n