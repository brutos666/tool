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

- l'utilisateur connecté
- l'utilisateur ADMIN
- tous les utilisateurs (accessible uniquement par l'ADMIN qui aura tous les droits dessus)

### Actions :

- création d'un nouveau compte (à faire en Java)

### Actions à faire :

- authentification
- suppression du compte
- modification du compte

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

# Ce qu'il en ressort

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

