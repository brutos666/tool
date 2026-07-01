# Arborescence du projet

```text
backend-go/
├── main
		├── controller
		├── entity
		├── handler
		├── mapper
		├── repository
		├── service
		└── main.go
├── modules
		├── authentication
		└── database
└── resources
		└── schema-[base].sql
```

# Nouvelle architecture

```text
backend-go/
├── main
		├── application			-> cas d'usage ou action métier
		├── domain					-> Logique métier (contient le contrat d'accès aux données)
		├── infrastructure	-> gestion des données, lecture/écriture des fichiers, congif, logging
		├── interface		 		-> présentation du résultat au navigateur
		└── main.go
├── modules
		├── authentication
		├── database
		└── treeConverter
└── resources
		└── schema-[base].sql
```

Dans le but de rendre le projet le plus limpide possible, je dois revoir la logique pour mettre en avant les objets qui vont orchestrer tout, en gardant une séparation avec la base de données, une séparation avec comment aller rechercher les données (pas forcément une base de données) et la logique métier (approche Domain Driven Development)

# La logique métier :

## Les utilisateurs :

### Entités :

- l'utilisateur connecté
- l'utilisateur ADMIN
- tous les utilisateurs (accessible uniquement par l'ADMIN qui aura tous les droits dessus)

### Actions :

- création d'un nouveau compte (à faire en Java)

### Actions à faire :

- authentification
- suppression du compte
- modification du compte

## Les tâches ou items

Un espace de navigation affiche une liste d'arbre d'items.
Chaque arbre peut être visualiser de différentes manières : sample mapping, todo list (futur: epic/feature/PBI/tache)

### Entités

- tous les items sous forme d'arbre

### Actions

- Alimenter l'espace de navigation avec la liste des arbres d'items
- Sauvegarder tout ou la vue courante

### A faire :

- import/export (fait en Java)
- associer un espace à un utilisateur
- gestion intelligente de la case à cocher TODO
- associer une vue à un item "racine" (todo list/sample mapping)
- pouvoir attribuer une fonction à un item
  - valeurs possibles : epic|feature|pbi|task, todo, story|rule|sample|question
  - Ne doit pas empêcher une visualisation qui n'est pas liée
  - NOTE : dans le cas du sample mapping, on peut avoir 2 fonctions pour le même niveau (sample|question)
- pouvoir définir des fonctions personnalisées
- pouvoir planifier tout ça (futur)

# Ce qu'il en ressort

Un utilisateur peut :

- s’enregistrer
- se connecter
- gérer des items (ajout, modification, suppression)

Un item (et son arborescence) peut :

- être sauvegardé
- être exporté
- être importé dans un espace
- être qualifiée (fonction)
- avoir une vue par défaut

Un espace peut :

- être chargé
- être sauvegardé
- être exporter
- être importer (ou plutôt on va importer dans un espace)

Aujourd'hui, dans la base de données, il n'y a pas de distinction entre ce qui est espace et arbre d'item : tout est arbre d'item et ce qui apparaît dans l'espace sont les arbres d'item dont le parent vaut -1.
Cela risque de changer.
Il faut donc clairement faire la distinction dans le code.

## 1ere étape : espace

- liste des items
- fonctions
  - chargement
  - export
  - sauvegarde

## 2eme étape : item

- id
- titre
- detail
- état (A faire, fait)
- statut : note les incohérences d'arborescence (Orphelin, boucle, suivant non trouvé, ...)
- enfants
- CRUD mode (inséré, modifié, supprimé, basé)
- fonctions
  - sauvegarde

