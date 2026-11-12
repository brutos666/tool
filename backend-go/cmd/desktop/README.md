# Déploiement

Compiler angular (NOTE: Les parenthèses permettent de lancer la commande dans un sous-shell. Comme cela on ne perd pas le chemin courant)

```bash
# Compilation front (NOTE: Les parenthèses permettent de lancer la commande dans un sous-shell sans perte répertoire courant)
(cd ../../../frontend-angular/ && npm run build)
# Copie du résultat
cp -r ../../../frontend-angular/dist ./frontend
## Compilation (embarque le front)
go build -o wails-tool .

```

