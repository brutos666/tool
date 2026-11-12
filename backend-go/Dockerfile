# ============================================
# Stage 1 : Dépendances
# ============================================
FROM golang:1.27.3-alpine3.24 AS pre-build

# Indique le répertoire où se trouve la base de données sqlite (base par défaut)
ENV DATABASE_PATH=/app/database
WORKDIR /app/database

# go.work (permet de définir les chemins pour utiliser les modules)
WORKDIR /app
COPY ./go.work ./go.work.sum ./
COPY --parents ./**/go.sum ./**/go.mod ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download

# ============================================
# Stage 2 : Développement avec debug
# ============================================
FROM pre-build AS dev
# Outil pour le debug dans vscode
RUN go install github.com/go-delve/delve/cmd/dlv@v1.27.2

COPY *.sql .
COPY ./config.dev.properties ./config.properties
COPY --parents ./**/*.go ./

# -gcflags="all=-N -l" désactive les optimisation qui empêchent le débogage
# --continue permet le démarrage du serveur sans attendre le debugger. Pour debugger le démarrage, il faut l'enlever
RUN --mount=type=cache,target=/go/pkg/mod \
  --mount=type=cache,target=/root/.cache/go-build \
  go build -gcflags="all=-N -l" -o /goTool ./cmd/server

ENV LISTEN_ADDR=:8090

# port d'écoute pour le debugger
EXPOSE 2345

CMD ["dlv", "exec", "/goTool", "--headless", "--listen=:2345", "--api-version=2", "--accept-multiclient", "--continue", "--", "-config", "config.properties"]

# ============================================
# Stage 3 : Compilation pour la production
# ============================================
FROM pre-build AS build
COPY --parents ./**/*.go ./
RUN CGO_ENABLED=0 go build -o /go-tool ./cmd/server

# ============================================
# Stage 3 : Production
# ============================================
FROM scratch AS prod

USER 65532:66666

# Indique le répertoire où se trouve la base de données sqlite (base par défaut)
ENV DATABASE_PATH=/app/database
WORKDIR /app/database

WORKDIR /app

# Le groupe 66666 devra avoir accès à la base de données du volume
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /go-tool /go-tool
# Faire un volume avec docker compose pour externaliser le fichier de configuration
COPY *.sql .
COPY config.properties .

ENV LISTEN_ADDR=:8090
EXPOSE 8090

ENTRYPOINT ["/go-tool"]
