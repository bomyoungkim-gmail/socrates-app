FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# Code is mounted via volume in docker-compose.yml for dev
# COPY . .

CMD ["npm", "run", "dev"]
