# Démarrage

Se positionner dans le même répertoire que ce readme (./frontend-angular)

## Hors docker

```bash
# Dev
ng serve

# Prod (pour tester en local)
ng serve -c production
```

## Docker en développement

```bash
docker build --target dev -t tool-angular:dev .
docker run --rm tool-angular:dev
# Pour un back qui écoute le port 8090
docker run --rm --network host -e BACKEND_URL="http://localhost:8090" tool-angular:dev
```

Utiliser l'url affichée dans les traces (ex: ➜ Network: http://192.168.1.29:8080/)

Pour un fonctionnement avec le back sans passer par docker compose (déconseillé), on devra faire en sorte que chaque partie communique entre elle (angular avec go, go avec la base de données)
Exemple avec un back en Go et une base de données dont les données sont dans le répertoire : ../database

> Docker Go écoute le port **:8090** (env LISTEN_ADDR DockerFile). Docker Angular redirige les requêtes /api/ vers **http://go:8090** (donnée par proxy.conf.docker.js + env BACKEND_URL DockerFile). Docker Db stocke les données dans le répertoire **/database** du projet (à l'extérieur de l'environnement de docker). Docker Go retrouve la base de données grâce au nom **db** de l'url "postgresql://postgres:postgres@**db**:5432/postgres?sslmode=disable", le nom db étant spécifié dans la commande docker via "--name db". Le tout fonctionne sur le même réseau de type bridge, nommé ici **angularGo**

> On préféra bien évidemment utiliser docker compose en choisissant les fichiers correspondant aux technos désirées

```bash
docker build --target dev -t tool-angular:dev .
docker build --target dev -t tool-go:dev ../backend-go/

docker network create angularGo
docker run --rm --network angularGo --name db \
  -e POSTGRES_PASSWORD=postgres \
  -v "$(pwd)/../database:/var/lib/postgresql/18/docker" \
  postgres:18.6-alpine3.24
docker run --rm --network angularGo --name go \
  -e DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres?sslmode=disable \
  -p 2345:2345 \
  tool-go:dev
docker run --rm --network angularGo --name angular -p 8080:8080 tool-angular:dev
```

> Ajouter -d pour lancer en arrière plan.

> L'extension Container tools "ms-azuretools.vscode-containers" est très utile pour la gestion des images, réseaux et conteneur

> Si des fichiers de configuration (*.json) ou des sources sont modifiées, il faut refaire 'docker build ...' pour reconstruire l'image

## Docker en production

```bash
docker build --target prod -t tool-angular:prod .
docker run --rm --network host -e BACKEND_URL="http://localhost:8090" tool-angular:prod
```

Lancer l'url http://localhost:8080

> "--network host" permet le fonctionnement avec le back lancé en local
> Si des fichiers de configuration (*.json) ou des sources sont modifiées, il faut refaire 'docker build ...' pour reconstruire l'image

## Docker compose (Recommandé)

Se placer sur la racine du projet tool.
Choisir les fichiers docker-compose pour utiliser la partie front angular

```shell
# Exemple go/angular/postgresql
docker compose -f docker-compose-go-angular.dev.yaml up --watch
```
