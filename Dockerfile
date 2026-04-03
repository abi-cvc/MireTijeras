# Dockerfile multi-stage para MireTijeras (frontend + backend)

# 1. Stage: Copiar frontend
FROM node:22 AS build-frontend
WORKDIR /app/frontend
COPY index.html ./
COPY css ./css
COPY js ./js
COPY html ./html
COPY images ./images

# 2. Stage: Backend
FROM node:22 AS build-backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ .

# 3. Stage: Producción con Nginx y Node.js
FROM nginx:1.25-alpine

# Copiar frontend a la imagen final
COPY --from=build-frontend /app/frontend /app/frontend

# Copiar backend a la imagen final
COPY --from=build-backend /app/backend /app/backend

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puertos
EXPOSE 8080

# Iniciar backend y Nginx
CMD ["/bin/sh", "-c", "node /app/backend/index.js & nginx -g 'daemon off;'"]
