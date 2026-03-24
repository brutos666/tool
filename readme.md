# Outil de gestion de tâches à faire

Pour l'instant, il s'agit de me former à l'utilisation de Spring boot et aussi apprendre à faire une application WEB à partir de zéro : l'application risque de ne pas faire grand chose !!!

Je souhaite m'en servir de modèle, je vais donc me concentrer à bien tout séparer même si chaque répertoire ne doit contenir qu'un seul répertoire.

Le projet utilise donc le framework Spring Boot et la partie front sera dans un premier temps le plus léger possible (pas de framework react, peut d’utilisation de bibliothèques.
La connexion à la base de données arrivera ensuite.

Le but est également de coder en étant le plus éco-responsable possible : une formation viendra après et j'espère que ce repo me permettra de mettre en application ce que j'aurais appris.

## Prérequis

- Java 21+
- Maven 3.8.7
- Node.js v26.0.0-nightly20260308f38a739623

## Lancer le projet en local

Récupérer le projet par un clone du repo GitHub

```shell
git clone https://github.com/brutos666/tool
```

### Backend

Lancer la partie back

```shell
cd backend-tool
mvn spring-boot:run
```

ou

```shell
npm run start
```

### Frontend

Installer l'extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) dabs Visual Studio Code et cliquer sur "Go Live" dans la barre d'état de l'IDE

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

