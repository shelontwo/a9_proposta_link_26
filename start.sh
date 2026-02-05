#!/bin/bash

echo "Iniciando sistema..."

# Backend
cd /app/backend
echo "Iniciando Backend na porta $PORT..."
node src/app.js & 

sleep 3

# Frontend
cd /app/frontend
echo "Iniciando Frontend..."
# Usamos HOSTNAME=0.0.0.0 para permitir que o Easypanel acesse o container
HOSTNAME=0.0.0.0 npm run dev &

wait -n