# Outil de gestion de tâches à faire

Pour l'instant, il s'agit de me former à l'utilisation de Spring boot et aussi apprendre à faire une application WEB à partir de zéro : l'application risque de ne pas faire grand chose !!!

Je souhaite m'en servir de modèle, je vais donc me concentrer à bien tout séparer même si chaque répertoire ne doit contenir qu'un seul répertoire.

Le projet utilise donc le framework Spring Boot et la partie front sera dans un premier temps le plus léger possible (pas de framework react, peut d'utlisation de bibliothèques.
La connexion à la base de données arrivera ensuite.

Le but est également de coder en étant le plus éco-responsable possible : une formation viendra après et j'espère que ce repo me permettra de mettre en application ce que j'aurais appris.

## Prérequis

- Java 25+
- Maven 3.8.7
- Node.js v26.0.0-nightly20260308f38a739623

## Lancer le projet

### Backend

cd backend-tool
mvn spring-boot:run

### Frontend
Ouvrir `frontend-vanilla-tool/index.html` dans un navigateur.

## Tests

### Backend
cd backend-tool
mvn test

### Frontend
cd frontend-vanilla-tool
npm test
