#!/bin/bash

echo "Instalando/Iniciando processos..."

# Backend
cd /app/backend && npm start &

# Frontend
cd /app/frontend && npm run dev -- --host 0.0.0.0 &

wait -n