FROM node:22-slim

WORKDIR /app

COPY . .

RUN cd backend && npm install
RUN cd frontend && npm install

RUN chmod +x start.sh

EXPOSE 3000
EXPOSE 3001

CMD ["./start.sh"]