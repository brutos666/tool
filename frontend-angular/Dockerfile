# ============================================
# Stage 1 : Dépendances et copie des sources
# ============================================
FROM node:lts-alpine3.24 AS pre-build

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY tsconfig*.json .
COPY angular.json .
COPY proxy.conf.docker.js proxy.conf.js
COPY /public ./public
COPY /src ./src

# ============================================
# Stage 2 : Développement et debug
# ============================================
FROM pre-build AS dev

ENV BACKEND_URL=http://go:8090

EXPOSE 8080
CMD ["npx","ng","serve","--host","0.0.0.0","--port","8080"]

# ============================================
# Stage 3 : Compilation pour la prod
# ============================================
FROM pre-build AS build
RUN npm run build

# ============================================
# Stage 4 : Production
# ============================================
FROM nginx/nginx-unprivileged:1.30-alpine-slim AS prod
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/frontend-angular/browser /usr/share/nginx/html

ENV BACKEND_URL=http://go:8090
# Evite les substitutions des variables $ dans le template nginx.conf
ENV NGINX_ENVSUBST_FILTER=BACKEND_

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1
