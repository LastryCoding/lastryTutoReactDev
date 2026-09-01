# React Quest

React Quest est un atelier public et ludique pour apprendre les bases de
TypeScript et React en construisant de vrais composants dans le navigateur.
Le parcours est en francais, ne demande aucun compte et conserve toute la
progression localement.

> Etat du projet : construction de la V1. Les fonctionnalites terminees et
> verifiees sont suivies dans [`docs/SUIVI.md`](docs/SUIVI.md). Cette mention
> sera retiree uniquement lorsque la Definition of Done V1 sera atteinte.

## Public vise

React Quest s'adresse aux personnes qui debutent en developpement front-end et
veulent pratiquer les notions utiles dans un projet React moderne sans suivre
de longs cours theoriques.

## Parcours V1

Le parcours principal compte 44 exercices de 10 a 20 minutes :

| Monde | Theme                       | Exercices |
| ----- | --------------------------- | --------: |
| 0     | Le Camp de base             |         4 |
| 1     | Les Fondations TypeScript   |         8 |
| 2     | La Forge des composants     |         8 |
| 3     | Le Temple du state          |         9 |
| 4     | La Riviere des effets       |         7 |
| 5     | Le Boss final : Job Tracker |         8 |

Un monde bonus Junior++ pourra ajouter jusqu'a 8 exercices sans bloquer la fin
du parcours principal.

## Principes produit

- aucun compte, backend applicatif, tracking ou analytics externe ;
- aucun code utilisateur execute ou transmis au serveur ;
- execution isolee dans le navigateur avec TutorialKit et WebContainers ;
- progression, code, reglages, XP et badges dans `localStorage` ;
- export, import et suppression complete de la progression par l'utilisateur ;
- erreurs expliquees comme des informations utiles, sans vies ni penalites ;
- IDE complet cible sur Chrome, Edge et navigateurs Chromium desktop recents ;
- cours et tableau de bord consultables sur mobile.

## Architecture retenue

La V1 utilise TutorialKit comme socle de tutoriel interactif. Des composants
React personnalises ajoutent la carte de progression, la persistance versionnee,
les validations pedagogiques et l'experience de jeu. WebContainers execute le
code des exercices exclusivement dans le navigateur.

TutorialKit `1.6.0` declare Astro 4 et React 18 dans sa matrice de compatibilite.
Le projet privilegie cette combinaison supportee plutot que les dernieres
versions majeures incompatibles. Toutes les versions effectives sont fixees dans
`pnpm-lock.yaml`.

| Technologie                 | Version V1 initiale |
| --------------------------- | ------------------- |
| TutorialKit                 | `1.6.0`             |
| Astro                       | `4.16.19`           |
| React                       | `18.3.1`            |
| TypeScript                  | `5.9.3`             |
| Vite du template d'exercice | `6.4.3`             |
| ESLint                      | `10.9.1`            |
| Prettier                    | `3.9.6`             |
| Vitest                      | `3.2.7`             |
| Playwright                  | `1.62.1`            |

Consulter :

- [`docs/VISION.md`](docs/VISION.md) pour les objectifs et non-objectifs ;
- [`docs/BIBLE.md`](docs/BIBLE.md) pour les invariants et decisions faisant foi ;
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) pour l'architecture technique ;
- [`docs/ROADMAP.md`](docs/ROADMAP.md) pour les jalons ;
- [`docs/SUIVI.md`](docs/SUIVI.md) pour l'avancement verifie.

## Developpement local

Prerequis : Node.js 20.19+ ou 22.12+, pnpm 10+, et un navigateur Chromium
recent.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Commandes de qualite disponibles :

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:content
pnpm test:e2e
pnpm build
```

La telemetrie Astro est desactivee dans les scripts du projet.

## Progression locale

La cle principale prevue est `reactquest:state:v1`. Le stockage est versionne,
valide avant restauration et migrable. Vider les donnees du navigateur efface
la progression, sauf si une sauvegarde JSON a ete exportee auparavant.

React Quest ne synchronise pas la progression entre appareils.

## Creer un exercice

Chaque exercice possede des metadonnees validees, une introduction, un starter,
trois indices maximum, une solution et des validations automatiques. Le starter
doit echouer a au moins une validation et la solution doit toutes les reussir.
Le contrat complet est documente dans
[`docs/EXERCISES.md`](docs/EXERCISES.md).

## Navigateurs

L'IDE cible officiellement Chrome et Edge desktop recents. Les capacites
`crossOriginIsolated`, `SharedArrayBuffer`, Service Worker et WebContainers sont
controlees avant le demarrage de l'atelier. Une page explicative est affichee
si l'environnement est incompatible.

## Production et Docker

Le build produit un site statique. L'image de production contiendra uniquement
les fichiers construits et un serveur statique non privilegie. Le Compose ne
publiera pas de port Internet et rejoindra le reseau Docker externe de Caddy.

Le deploiement VPS est realise par un agent distinct. Les artefacts et commandes
de deploiement seront documentes dans `docs/DEPLOYMENT.md`.

## Confidentialite

Aucun compte n'est cree et aucune progression n'est envoyee au proprietaire du
site. Aucun code saisi n'est stocke dans les logs serveur. L'utilisateur peut
exporter ou supprimer ses donnees locales depuis l'application.

## Tests et qualite

La CI executera le lint, le typecheck, les tests unitaires, les tests de
composants, la validation de tout le contenu et le build. Playwright couvrira le
parcours critique incluant sauvegarde, execution, validation, XP et export/import.

## Licence et WebContainers

Le code produit pour React Quest est distribue sous licence MIT, sous reserve
des licences de ses dependances. Les conditions d'utilisation de WebContainers
doivent etre revalidees avant toute exploitation commerciale du projet.

## Limites connues

TutorialKit 1.6.0 impose Astro 4 et son ecosysteme Vite 5. L'audit de dependances
de developpement remonte des avis de securite corriges uniquement dans des
versions majeures qu'il ne supporte pas. Le livrable de production est statique,
n'embarque ni Node ni ces dependances et n'utilise aucune donnee distante au
build. Cette dette reste documentee dans `docs/SUIVI.md` et devra etre reevaluee
des qu'une version compatible de TutorialKit sera publiee.
