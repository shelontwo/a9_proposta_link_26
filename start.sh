#!/bin/bash

echo "Iniciando sistema em modo PRODUÇÃO..."

# Backend
cd /app/backend
echo "Iniciando Backend na porta 3001..."
node src/app.js & 

sleep 5

# Frontend
cd /app/frontend
echo "Iniciando Frontend na porta 3000..."
# Usamos o 'npm start' em vez do 'npm run dev'
PORT=3000 HOSTNAME=0.0.0.0 npm start &

wait -n