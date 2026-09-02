# Contribuer a React Quest

## Prerequis

- Node.js `20.19.0` ou version compatible avec `>=20.19.0` ;
- pnpm `10.15.0` via Corepack ;
- Microsoft Edge recent uniquement pour le parcours E2E local.

Installer le projet depuis la racine :

```bash
corepack enable
corepack prepare pnpm@10.15.0 --activate
pnpm install --frozen-lockfile
```

Ne pas utiliser npm ou Yarn a la racine et ne pas modifier le lockfile sans
changement explicite de dependance.

## Developpement

Creer une branche courte depuis `main`, limiter chaque changement a un sujet et
lancer le serveur local :

```bash
git switch main
git pull --ff-only
git switch -c type/sujet-court
pnpm dev
```

Les noms de composants, fonctions, variables et types restent en anglais. Le
contenu pedagogique et les textes visibles restent en francais. Eviter `any`, les
dependances non necessaires et les changements de format sans rapport.

## Validation locale

Avant une pull request, executer les memes controles que la CI :

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:content
pnpm validate:exercises
pnpm build
```

`pnpm build` repete certaines validations intentionnellement afin que le build de
production reste autonome.

Playwright n'est pas execute dans GitHub Actions pour le moment. La configuration
E2E cible le canal `msedge`, disponible localement mais absent des runners Linux
standards. Toute modification du parcours interactif doit donc aussi etre
verifiee sur un poste equipe de Microsoft Edge :

```bash
pnpm test:e2e
```

Ne remplacez pas silencieusement Edge par Chromium dans la CI. Une matrice E2E
distante pourra etre ajoutee lorsqu'un navigateur cible et son comportement avec
WebContainers, COOP et COEP auront ete valides.

## Exercices

Un exercice doit conserver un starter qui echoue pour la competence visee et une
solution qui passe TypeScript, ESLint et Vitest. Ajouter ou modifier un exercice
implique au minimum :

```bash
pnpm validate:content
pnpm validate:exercises
```

Ne pas inclure de fichiers generes, `node_modules`, resultats Playwright, rapports
de couverture, journaux ou variables d'environnement dans une contribution.

## Pull request

La description doit indiquer le probleme traite, le comportement obtenu, les
commandes executees et toute limite connue. Garder les commits lisibles et ne pas
melanger refactorisation, contenu pedagogique et changement d'infrastructure sans
necessite concrete.
