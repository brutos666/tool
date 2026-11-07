# Démarrage

Se positionner dans le même répertoire que ce readme (./frontend-vanilla-tool)

## Hors docker

Pour fonctionner avec le back sans soucis de cross-domain, il faut un reverse-proxy quelque soit la technologie utilisée pour servir le front.

```bash
# Pour un back qui écoute le port 8090
npx local-web-server --rewrite '/api/(.*) -> http://localhost:8090/api/$1'
```

Lancer l'url http://localhost:8000

## Docker en développement

```bash
docker build --target dev -t tool-vanilla:dev .
docker run --rm tool-vanilla:dev
# Pour un back qui écoute le port 8090
docker run --rm --network host -e BACKEND_URL="http://localhost:8090" tool-vanilla:dev
```

Lancer l'url http://localhost:8081

> "--network host" permet le contact avec le back qui tourne sur le poste

> Si un fichier est modifié, il faut refaire 'docker build ...' pour reconstruire l'image

## Docker en production

```bash
# En prod, variable d'environnement obligatoire (passer par docker compose chez le client)
docker build --target prod -t tool-vanilla:prod .
docker run --rm tool-vanilla:prod
# Pour un back qui écoute le port 8090
docker run --rm --network host -e BACKEND_URL="http://localhost:8090" tool-vanilla:prod
```

Lancer l'url http://localhost:8081

> "--network host" permet le contact avec le back qui tourne sur le poste

> Si un fichier est modifié, il faut refaire 'docker build ...' pour reconstruire l'image

## Docker compose (Recommandé)

Se placer sur la racine du projet tool.
Choisir les fichiers docker-compose pour utiliser la partie front en vanilla JS

```shell
# Exemple go/vanilla/sqlite
docker compose -f docker-compose-go-vanilla-sqlite.dev.yaml up --watch
```

Lancer http://localhost:8081/

# Arborescence du projet

Approche Domain Driven Development

```text
frontend-vanilla-tool/
├── public
│		├── css             -> styles avec système de calques
│		└── style.html      -> page de certains composants en appliquant le style
├── src
│		├── commands        -> commandes (export/sauvegarde/...)│
│		├── components      -> composants
│   │   ├─── views      -> vues des composants
│   │   └── decorators  -> composants de type décorateurs
│   │       └── views   -> vues des décorateurs
│		├── data            -> Données (item, utilisateur)
│		├── requests        -> appels requêtes HTTP
│		└── index.html      -> page principale de l'application
│		└── login.html      -> page d'authentification
└── test                -> tests unitaires
```

# La logique métier :

## Les utilisateurs :

- l'utilisateur connecté
- l'utilisateur ADMIN (à faire)
- tous les utilisateurs, accessible uniquement par l'ADMIN qui aura tous les droits dessus (à faire)

### Actions :

- création d'un nouveau compte (à faire en Java)
- authentification (à faire en Java)

### Actions à faire :

- suppression du compte
- modification du compte
- attribution des taches à l'utilisateur connecté

## Les espaces

Une zone de navigation affiche la liste d'espaces.
Chaque espace est un arbre de sous-espace qui peuvent être visualisé (zone de gauche) de différentes manières (vue) : sample mapping, todo list (futur: epic/feature/PBI/tache).
Un espace se définit par son titre, son état d'avancement (fait/à faire), une définition détaillée et ses sous-espaces
Un espace peut être créé, modifié ou supprimé
Un espace avec une arborescence incohérente apparaît en erreur quand il apparaît !! L'algo ne retourne pas (encore) les branches non rattachées à un espace racine (idem java)

### Actions

- Alimenter l'espace de navigation avec la liste des espaces
- Sauvegarder tous les espaces ou l'espace courant (qui est également celui visualisé dans la zone de droite)

### A faire :

- import/export (fait en Java)
- associer un espace à un utilisateur
- gestion intelligente de la case à cocher TODO
- associer une vue à un espace "racine" (todo list/sample mapping)
- pouvoir attribuer une fonction à un espace
  - valeurs possibles : epic|feature|pbi|task, todo, story|rule|sample|question
  - Ne doit pas empêcher une visualisation qui ne serait pas liée
  - NOTE : dans le cas du sample mapping, on peut avoir 2 fonctions pour le même niveau (sample|question)
- pouvoir définir des fonctions personnalisées
- pouvoir planifier tout ça (futur)

# Résumé des fonctionnalités attendues (pas encore toutes présentes en Go)

Un utilisateur peut :

- s’enregistrer
- se connecter
- gérer des espaces ou sous-espaces (ajout, modification, suppression)

Un espace (et son arborescence) peut :

- être sauvegardé
- être exporté
- être importé à la suite des espaces
- être qualifiée (fonction)
- avoir une vue par défaut

Les espaces racines peuvent :

- être chargés
- être sauvegardés
- être exportés
  On peut importer une liste d'espace dans la zone de navigation

