#!/bin/bash

echo "Limpando portas antigas..."
# O comando fuser mata qualquer processo travado nas portas
fuser -k 3000/tcp
fuser -k 3001/tcp

# Backend
echo "Iniciando Backend na porta 3001..."
cd /app/backend
# Forçamos a porta 3001 apenas para este comando
PORT=3001 node src/app.js & 

sleep 5

# Frontend
echo "Iniciando Frontend na porta 3000..."
cd /app/frontend
# Forçamos a porta 3000 e o host para o Next.js
PORT=3000 HOSTNAME=0.0.0.0 npm run dev &

wait -n