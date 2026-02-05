#!/bin/bash

# Backend
echo "Iniciando Backend..."
cd /app/backend && node src/app.js & 

# Espera um pouco
sleep 2

# Frontend
echo "Iniciando Frontend..."
cd /app/frontend && npm run dev -- --host 0.0.0.0 &

wait -n