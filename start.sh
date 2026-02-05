
echo "Limpando processos antigos..."
fuser -k 3000/tcp
fuser -k 3001/tcp

echo "Iniciando Backend..."
cd /app/backend && node src/app.js & 

sleep 5

echo "Iniciando Frontend..."
cd /app/frontend

if [ -d ".next" ]; then
    echo "Pasta .next confirmada em $(pwd)"
    PORT=3000 HOSTNAME=0.0.0.0 npm start
else
    echo "ERRO CRÍTICO: Pasta .next não existe em $(pwd). Tentando build de emergência..."
    npm run build && PORT=3000 HOSTNAME=0.0.0.0 npm start
fi

wait -n