FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY ./client/package*.json ./client/
COPY ./server/package*.json ./server/
RUN npm ci --silent
COPY . .
COPY client/src/data/*.json ./client/src/data/*.json
ARG MODE=production
RUN npm run build-fullstack --mode=$MODE