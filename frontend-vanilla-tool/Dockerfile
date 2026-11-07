# ============================================
# Stage 1 : Copie des sources
# ============================================
FROM nginx/nginx-unprivileged:1.30-alpine-slim AS static

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

WORKDIR /usr/share/nginx/html

COPY *.html .

COPY /public ./public
COPY /src ./src
COPY /test ./test

ENV BACKEND_URL=http://go:8090
# Evite les substitutions des variables $ dans le template nginx.conf
ENV NGINX_ENVSUBST_FILTER=BACKEND_

# ============================================
# Stage 2 : Développement et debug
# ============================================
FROM static AS dev
EXPOSE 8081

# ============================================
# Stage 3 : Production
# ============================================
FROM static AS prod
EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://127.0.0.1:8081/health || exit 1
