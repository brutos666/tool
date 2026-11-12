# C'est quoi ce repo ?

Le but du projet est de mettre en pratique les connaissances apprises ou en cours d'apprentissage.
Voici la liste non exhaustive :

- Java :
  - spring boot : travail pour limiter les dépendances. Difficulté à savoir qui sert à quoi
- Go
  - DDD : Mise en place d'une architecture Domain Driven Design. Le but était de bien séparer les règles métiers (domain, application), les données (infrastructure) et le traitement des requêtes (interface).
  - généricité :
    - pour la centralisation des lectures des paramètres des requêtes et du renvoi de la réponse à transformer en objet
    - arbres
  - authentification
  - modules
    - tokens et mot de passe pour l'authentification
    - requêtes base de données
    - arbre : conversions arbre en liste plate et inversement
  - Limitations des connexions à la base de données : utilisation de jetons pour n'autoriser qu'un nombre limité d'accès à la base de données en même temps
  - Limitation du nombre de requêtes : dans le projet cartographie middleware.go
  - test avec "Go - Test Suites" qui permet une meilleure organisation des tests (ressemble à Mocha)
- vanilla JS (pas besoin de node.js)
  - framework from scratch en essayant de rendre atomique chaque composant, de séparer la vue de la logique du composant
  - décorateurs : pour ajouter des fonctionnalités et/ou décorer la vue
  - isolation :
    - commandes
    - composants (TODO: les managers qui s'occupent du focus n'ont pas leurs places ici !!!!)
    - vues
    - décorateurs
    - données
    - requêtes http
  - navigation
  - drag&drop
  - un peu d'accessibilité
  - tests unitaires avec mocha
  - barre de menu vertical si plus la place en horizontal (la navigation avec les flèches changent)
  - CSS :
    - séparation des styles en calques (grace aux tutos de Grafikart !!)
    - utilisation de variables
    - application d'un zoom, utilisation de container, modification du contenu quand il est trop petit
- Angular 22
  - RxJS : sujet, observable
  - signaux
  - directives : gestion de la navigation avec des directives
  - services
  - intercepteur pour afficher les messages de succès ou d'erreur
  - formulaire avec signaux (dans le repo cartographie) (https://angular.dev/essentials/signal-forms)
- Docker
  - Modifications pour externaliser ce qui doit l'être (configs, sql, port, listen, ...)
  - création des fichiers DockerFile et docker-compose
  - Pouvoir modifier les sources et debugger dans un environnement lancé via docker compose

# Outil de gestion de tâches à faire

L'outil doit permettre de saisir le travail à faire sous différentes formes :

- todo liste : s'affiche sous forme d'arbre
- sample mapping : story/rules/samples (table)
- futur : epic, feature, item...

Selon les technologies et leurs avancées, des fonctionnalités sont plus ou moins présentes.

## Affichage

L'interface comprend :

- une page de connexion (on ne peut que créer un compte et s'authentifier)
- une page de travail avec :
  - une barre de commande en haut
  - un espace de navigation à gauche qui affiche des arbres de tâches
  - un espace de visualisation à droite qui affiche ce qui est sélectionner à gauche, sous la forme choisie
    - TODO liste
    - sample mapping

## Navigation

La navigation au clavier permet de naviguer dans le menu, dans les arbres et dans le sample mapping. On peut rentrer dans un item avec la touche Enter et en sortir avec la touche Echap.

## Drag&Drop

Il est possible de déplacer des arbres à la souris ou au clavier.

## Commandes

Création, modification, suppression et déplacement sont validés lors de la sauvegarde de la vue courante ou la sauvegarde générale (utile si on a fait des modifications dans un autre arbre que celui visualisé à droite).
Il est possible d'exporter les données dans un fichier et d'importer à partir d'un fichier.

# Installation

## Prérequis

Pas besoin de prérequis en utilisant les conteneurs docker.
Si besoin de travailler hors conteneur, se référer aux versions en parcourant les fichiers DockerFile.

## Base de données

Si la base de données est paramétrée pour atterrir dans le répertoire /database, les droits d'accès doivent être partagés entre le développeur et l'utilisateur du conteneur (UID=65532, GID=66666 en prod).
On va donc créer le groupe dbaccess avec le numéro 66666, s'octroyer ce groupe et donner les droits au répertoire database

```bash
sudo groupadd -r -g 66666 dbaccess
sudo usermod -aG dbaccess $USER    # toi
sudo chown -R :dbaccess ./database
sudo chmod -R g+rwX ./database
```

## Pour développer et debugger dans l'environnement du conteneur

Récupérer le projet par un clone du repo GitHub

```shell
git clone https://github.com/brutos666/tool
```

### Lancer docker en mode développement

Exemple pour un back en Go, un front en Angular et une Base de données postgresql

```shell
# Exemple pour un back en Go, un front en Angular et une Base de données postgresql
docker compose -f docker-compose-go-angular.dev.yaml build
docker compose -f docker-compose-go-angular.dev.yaml up --watch
# Lancer l'url indiquée pour "Network"

# Exemple pour un back en Go, un front en Vanilla Js et une Base de données sqlite
docker compose -f docker-compose-go-vanilla-sqlite.dev.yaml build
docker compose -f docker-compose-go-vanilla-sqlite.dev.yaml up --watch
# Lancer l'url http://localhost:8081
```

Pour les arrêter :

```shell
docker compose -f docker-compose-go-angular.dev.yaml down
docker compose -f docker-compose-go-vanilla-sqlite.dev.yaml down
```

### Attacher le debugger Go via delve

Les fichiers DockerFile et docker-compose-dev.yaml sont écrit pour pouvoir mettre en place le debug du back
Pour cela, ajouter la configuration suivante dans le fichier :
.vscode/launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach Go (Docker)",
      "type": "go",
      "request": "attach",
      "mode": "remote",
      "host": "127.0.0.1",
      "port": 2345,
      "substitutePath": [{ "from": "${workspaceFolder}/go/main", "to": "/src" }]
    }
  ]
}
```

### Docker en mode production

Exemple pour un back en Go, un front en Angular et une Base de données postgresql

```shell
# Compiler
docker compose -f docker-compose-go-angular.prod.yaml build
# Démarrer
docker compose -f docker-compose-go-angular.prod.yaml up
# Arrêter
docker compose -f docker-compose-go-angular.prod.yaml down
```

Exemple pour un back en Go, un front en Angular et une Base de données sqlite

```shell
# Compiler
docker compose -f docker-compose-go-angular-sqlite.prod.yaml build
# Démarrer
docker compose -f docker-compose-go-angular-sqlite.prod.yaml up
# Arrêter
docker compose -f docker-compose-go-angular-sqlite.prod.yaml down
```

### Publier les images dans docker Hub

Avoir un compte : https://www.docker.com/
Documentation :
https://docs.docker.com/build/building/registry-auth/

Mon compte :
https://app.docker.com/accounts/brutos666

```bash
# se connecter
docker login

# Angular
## Construire l'image
cd frontend-angular
docker build --target prod -t tool-angular:prod .
## publier dans la registry de docker hub
docker tag tool-angular:prod brutos666/angularbrutostool
docker push brutos666/angularbrutostool
# Go
## Construire l'image
cd backend-go
docker build --target prod -t tool-go:prod .
## publier dans la registry de docker hub
docker tag tool-go:prod brutos666/gobrutostool
docker push brutos666/gobrutostool
```

# Utiliser render

Avoir un compte sur https://dashboard.render.com/

## Go - PostGres - Vanilla JS

### Postgres

- Ajouter un nouveau service PostGres (bouton "+ New" puis "PostGres").
- Récupéré l'url de connexion en cliquant sur le bouton "Connect" puis l'onglet "Internal"

> Les données seront perdues au bout de 30 jours avec la version gratuite. Pensez à exporter les tâches si besoin.

### Go

- Ajouter nouveau service web (bouton "+ New" puis "Web Service")
- Saisir l'image "brutos666/gobrutostool"
- MANAGE/Environment, ajouter les variables :
  - DATABASE_URL: l'url de connexion récupéré du service PostGres
  - DATABASE_DRIVER: postgres
  - DATABASE_SQL: schema-postgresql.sql
  - MUST_AUTHENTICATE: true => si on veut tester avec une authentification

### Vanilla JS

- Ajouter nouveau site static (bouton "+ New" puis "Static site")
- Saisir le Public Repository "https://github.com/brutos666/tool".
- Saisir le Root Directory "frontend-vanilla-tool/"
  MANAGE/Environment, ajouter la variable :
  - BACKEND_URL: url récupéré depuis le service Go
- MANAGE/Redirects/Rewrite ajouter la règle :
  - Source : /api/\*, Destination : https://gobrutostool.onrender.com/api/*, Action: Rewrite

### Déployer

Déployer et tester avec l'url du service Vanilla

## Go-Sqlite-Angular

> Les données seront perdues à chaque déploiement. Pensez à exporter les tâches si besoin

### Go

- Ajouter nouveau service web (bouton "+ New" puis "Web Service")
- Saisir l'image "brutos666/gobrutostool"
- MANAGE/Environment, ajouter la variable :
  - MUST_AUTHENTICATE: false => l’authentification n'a pas été portée en Angular

### Angular

- Ajouter nouveau service web (bouton "+ New" puis "Web Service")
- Saisir l'image "brutos666/angularbrutostool"
- MANAGE/Environment, ajouter la variable :
  - BACKEND_URL: url récupéré depuis le service Go

## Lancer le projet sans docker

TODO : Mettre à jour la documentation quand le DockerFile sera fait et qu'on saura exactement de quoi il y a besoin

### Backend Java

Lancer la partie back

```shell
cd backend-tool
mvn spring-boot:run
```

ou

```shell
npm run start
```

### Backend Go

```bash
# Dev
go run ./main -config config.dev.properties

# Prod (utilise config.properties par défaut)
go run ./main
```

### Frontend Vanilla JS

Pour fonctionner avec le back sans soucis de cross-domain, il faut un reverse-proxy quelque soit la technologie utilisée pour servir le front.

```bash
# Pour un back qui écoute le port 8090
npx local-web-server --rewrite '/api/(.*) -> http://localhost:8090/api/$1'
```

Lancer l'url http://localhost:8000

### Frontend Angular

```bash
# Dev
ng serve

# Prod (pour tester en local)
ng serve -c production
```

Lancer l'url http://localhost:4200

## Lancer les tests

### Backend

```shell
cd backend-tool
mvn test
```

### Frontend

```shell
cd frontend-vanilla-tool
npm test
```

