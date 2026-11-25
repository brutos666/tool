# Installer Wails 3

Suivre le guide "get Started" de Wails : https://wails.io/quick-start/installation/

# Déploiement

Compiler angular (NOTE: Les parenthèses permettent de lancer la commande dans un sous-shell. Comme cela on ne perd pas le chemin courant)

```bash
# Démarrer en mode déveoppement
wails3 dev
# Compilation pour la production
wails3 build
# Construction du paquet linux si on est sur une distribution Linux
wails3 package
# Construction du paquet Windows en utilisant docker
task setup:docker
wails3 build GOOS=windows
wails3 package GOOS=window

## Compilation rapide partie Go (embarque le front et le fichier SQL)
go build -o wails-tool .

```

