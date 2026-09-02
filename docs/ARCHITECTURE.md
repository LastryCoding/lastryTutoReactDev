# Architecture

## Vue d'ensemble

React Quest est un site statique Astro enrichi par des ilots React. TutorialKit
fournit la structure des tutoriels, l'editeur, le terminal, le serveur de
developpement et la previsualisation. Le code d'exercice est execute dans un
WebContainer demarre cote navigateur.

```text
Navigateur
  Astro statique
  React Quest UI
    Dashboard et carte
    Store local versionne
    Progression, XP et badges
    Adaptateurs TutorialKit
  TutorialKit Runtime
    Editeur et fichiers
    Terminal et preview
    WebContainer
      Vite + React
      TypeScript + ESLint
      Vitest + validations
```

Le serveur de production sert uniquement des fichiers statiques. Il ne recoit
ni progression, ni code, ni commande d'execution.

## Frontieres prevues

- `src/content/tutorial/` : chapitres, lecons et fichiers TutorialKit ;
- `src/components/` : interface React Quest et remplacements TutorialKit ;
- `src/domain/` : modeles purs de progression, XP et deblocage ;
- `src/storage/` : validation, migrations, import et export ;
- `src/validation/` : format de resultats et orchestration des commandes ;
- `src/styles/` : tokens, themes, responsive et accessibilite ;
- `scripts/` : validation statique de l'ensemble du contenu ;
- `tests/` : tests unitaires, composants et parcours Playwright.

Ces chemins restent provisoires jusqu'au spike, car les points d'extension reels
de TutorialKit doivent etre confirmes avant de figer l'arborescence.

## Flux d'un exercice

1. L'utilisateur ouvre une lecon deverrouillee.
2. Le store charge les fichiers modifies valides ou le starter courant.
3. Le runtime initialise paresseusement le WebContainer.
4. TutorialKit monte le template partage et les fichiers de la lecon.
5. Les modifications sont sauvegardees localement avec debounce.
6. Executer lance ou relance Vite et met a jour la preview.
7. Formater applique Prettier au fichier actif.
8. Verifier execute TypeScript, ESLint et les validations de la lecon.
9. Un resultat structure est traduit en message pedagogique.
10. La premiere reussite attribue l'XP, les badges et debloque la suite.

## Stockage

Le navigateur reste l'unique autorite des donnees utilisateur. Les fonctions de
domaine manipulent un etat immutable et serialisable. Une couche de stockage
valide les entrees externes, applique les migrations et gere les erreurs sans
faire tomber l'interface.

La progression valide utilise `reactquest:state:v1`. Si cette valeur est
illisible, son contenu brut est copie dans `reactquest:state:corrupted` avant de
repartir d'un etat initial. Un import est parse, migre et valide en memoire avant
toute ecriture. L'export, l'import, la suppression de l'archive illisible et la
reinitialisation totale restent des actions locales explicites.

## Validation du contenu

Un registre genere et valide les metadonnees. Un script de CI verifie les
identifiants, prerequis, fichiers, solutions, differences starter/solution et
commandes. Les starters et solutions sont testes sur le meme template afin de
garantir respectivement au moins un echec et un succes complet.

## Deploiement

Le build Astro statique est copie dans une image runtime minimale. Le conteneur
rejoint un reseau Docker externe fourni par le deploiement et n'expose aucun port
sur l'hote. Caddy termine TLS, ajoute COOP/COEP et reverse-proxy le serveur
statique. Les noms reels du reseau et des snippets Caddy sont adaptes sur le VPS.

## Resultats de l'initialisation

- le format officiel `_files` et `_solution` est compile par TutorialKit ;
- le template React partage est fusionne dans les fichiers de la lecon ;
- les commandes de preparation, serveur et terminaux sont configurables ;
- l'API experimentale fournit snapshot, update, reset, solve et WebContainer ;
- les dependances TutorialKit doivent rester strictement epinglees car cette API
  peut casser lors d'une mise a jour mineure.

## Resultats du spike vertical

- `lessonFullyLoaded` prouve le montage des fichiers mais pas la fin de `npm ci` ;
- la preview `ready` est l'autorite pour activer les commandes de l'atelier ;
- `takeSnapshot` permet de comparer le projet courant au starter et de ne stocker
  que les fichiers modifies ;
- `prettier/standalone` est plus deterministe que `npx` dans le shell WebContainer ;
- TypeScript, ESLint et Vitest sont lances par `webcontainer.spawn` et leurs codes
  de sortie alimentent un resultat structure ;
- le starter et la solution sont verifies hors navigateur avec le meme template.

## Risques techniques a lever par le spike

- surface exacte de remplacement des composants TutorialKit 1.6.0 ;
- comportement Playwright de WebContainers sous headers d'isolation ;
- limites de stockage et temps d'installation du template partage.
