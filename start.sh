#!/bin/bash

echo "Iniciando sistema..."

# O Easypanel injeta as variáveis de ambiente em todos os processos
# iniciados a partir daqui.

# Backend
cd /app/backend
echo "Iniciando Backend na porta $PORT..."
node src/app.js & 

sleep 3

# Frontend
cd /app/frontend
echo "Iniciando Frontend..."
# Adicionamos o --host para o Next.js aceitar conexões externas do Easypanel
npm run dev -- --host 0.0.0.0 &

wait -n