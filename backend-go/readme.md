# Démarrage

Se positionner dans le même répertoire que ce readme (./backend-go)

## Hors docker

```bash
# Dev
go run ./main -config config.dev.properties

# Prod (utilise config.properties par défaut)
go run ./main
# -schema pour spécifier le .sql à lancer pour initialiser la base de données
go run ./main -schema schema-postgresql.sql
```

## Docker en développement

```bash
docker build --target dev -t tool-go:dev  .
# host permet d'avoir l'accès à la base de données qui est à l'extérieur du conteneur
docker run --rm --network host tool-go:dev
```

** Si le fichier de configuration (config.dev.properties) ou si le fichier d'initialisation de la base de données (xxx.sql) est modifié, il faut refaire 'docker build ...' pour reconstruire l'image **

### Attacher le debugger Go via delve

Les fichiers DockerFile et docker-compose-dev.yaml sont écrit pour pouvoir mettre en place le debug du back Pour cela, ajouter la configuration suivante dans le fichier : .vscode/launch.json

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

## Docker en production

```bash
# En prod, variable d'environnement obligatoire (passer par docker compose chez le client)
docker build --target prod -t tool-go:prod .
docker run --rm --network host tool-go:prod
```

** Si le fichier de configuration (config.dev.properties) ou si le fichier d'initialisation de la base de données (xxx.sql) est modifié, il faut refaire 'docker build ...' pour reconstruire l'image **

## Docker compose (Recommandé) (En cours)

Se placer sur la racine du projet tool.
Choisir les fichiers docker-compose pour utiliser la partie back en go

```shell
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up --watch
```

# Arborescence du projet

Approche Domain Driven Development

```text
backend-go/
├── main
		├── application			-> cas d'usage ou action métier
		├── domain					-> Logique métier (contient le contrat d'accès aux données)
		├── infrastructure	-> gestion des données, lecture/écriture des fichiers, logging
		├── interface		 		-> présentation du résultat au navigateur
		|
		├── config					-> lecture du fichier.properties et/ou des variables d'environnement
		├── generic					-> Interfaces transverses
		└── main.go
├── modules
		├── authentication
		├── database
		└── treeConverter
└── config.properties
└── schema-[base].sql
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

