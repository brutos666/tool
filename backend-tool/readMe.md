# Utilisation de profils

Le fichier pom.xml définit des profiles pour gérer les différences du projet côté back
entre la prod et la dev (profil dev par défaut)
Les fichiers properties correspondant sont bien pris en compte.
Pour lancer les commandes avec le bon profile, il faut le spécifier avec -Pprod ou -Pdev

```bash
mvn dependency:tree -Pprod
mvn clean package -Pprod
```

# Préparer une release

Pour préparer une release (passer de 1.0.0-SNAPSHOT à 1.0.0) :

```bash
mvn release:prepare
mvn release:perform
```

(Cela crée automatiquement un tag Git et incrémente la version.)

# Mettre à jour les dernières version

```bash
mvn versions:use-latest-versions
```

# Bonnes pratiques

- Utilise un fichier CHANGELOG.md pour documenter les changements entre versions.
- Automatiser les builds (GitLab CI ??)
- Tagger les releases :

```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```