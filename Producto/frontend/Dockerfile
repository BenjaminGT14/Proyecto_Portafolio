# syntax=docker/dockerfile:1

# ============================================================
# Etapa 1 (build): compila el frontend de React con Vite.
# Vite "hornea" la URL del backend en el momento del build (no en runtime),
# por eso VITE_API_URL entra como ARG y debe estar presente al hacer build.
# ============================================================
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ============================================================
# Etapa 2 (runtime): nginx sirve los archivos estaticos generados (carpeta dist).
# nginx es un servidor web minimo; solo entrega HTML/CSS/JS.
# ============================================================
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
