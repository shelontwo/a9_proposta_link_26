#!/bin/bash
source ~/.nvm/nvm.sh
nvm use v22.11.0 || nvm install v22.11.0

# Start Backend
echo "Starting Backend..."
cd /app/backend && npm start &
npm start &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend..."
cd /app/frontend && npm run dev &
npm run dev &
FRONTEND_PID=$!

# Trap to kill both on exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
