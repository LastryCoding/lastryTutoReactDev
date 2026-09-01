# Bible React Quest

Ce document est la source de verite fonctionnelle et technique du projet. En cas
de contradiction, l'ordre de priorite est : securite et confidentialite, present
document, tests automatises, architecture documentee, implementation.

## Regles de pilotage

- `docs/SUIVI.md` distingue toujours fait, verifie, bloque et prevu.
- `docs/ROADMAP.md` est mis a jour a la fin de chaque jalon.
- toute decision structurante est inscrite ici ou dans `docs/ARCHITECTURE.md` ;
- chaque jalon fonctionnel termine donne lieu a un commit clair ;
- apres une compaction de contexte, relire `BIBLE.md`, `VISION.md`, `ROADMAP.md`
  et `SUIVI.md` avant de poursuivre ;
- ne jamais inventer un resultat de test, de CI ou de deploiement.

## Invariants de securite

- aucun endpoint d'execution de code ;
- aucun code utilisateur envoye au VPS ou a une API tierce ;
- aucun secret dans le front, le depot, l'image ou les exemples ;
- aucun compte, cookie d'authentification, email, tracking ou analytics ;
- execution des exercices dans WebContainers, dans le navigateur ;
- assets locaux et dependances verrouillees ;
- headers COOP et COEP obligatoires en production pour l'IDE.

## Decisions d'architecture

- TutorialKit est le socle de contenu et d'atelier interactif.
- Astro genere le site statique et React porte les interfaces interactives.
- WebContainers est demarre paresseusement seulement depuis un exercice.
- Une instance WebContainer est reutilisee quand le runtime le permet.
- Le stockage principal est `reactquest:state:v1` et respecte un schema valide.
- Les exercices utilisent un template partage et des surcharges de fichiers.
- La validation combine TypeScript, ESLint, tests et controles fonctionnels.
- Le runtime serveur de production ne contient aucune logique applicative.

## Compatibilite des versions

TutorialKit `1.6.0` declare Astro `^4.15.0`, React `^18.3.1` et WebContainer API
`1.5.1`. La V1 commence avec cette matrice supportee. Une montee vers Astro 7,
React 19 ou une API WebContainer plus recente n'est acceptee qu'apres un spike
reussi et sans contournement fragile.

## Contrat pedagogique

- interface et explications en francais ;
- symboles de code en anglais ;
- une consigne courte suivie d'un objectif concret ;
- starter partiel contenant des commentaires TODO utiles ;
- guidage decroissant au fil du parcours ;
- trois indices progressifs maximum ;
- solution revelee uniquement sur action explicite ;
- revelation enregistree sans bloquer la progression ;
- recapitulatif court apres reussite ;
- messages d'erreur orientes vers la prochaine action.

## Contrat d'un exercice

Chaque exercice declare : `id`, `slug`, `title`, `world`, `order`, `prerequisites`,
`estimatedMinutes`, `xp`, `difficulty`, `concepts`, `visibleFiles`, `hiddenFiles`,
`runCommand`, `validationCommand`, `hints`, `solution`, `feedback` et
`contentVersion`.

Chaque exercice contient un starter, une solution et des validations. Le starter
doit echouer a au moins une condition. La solution doit toutes les satisfaire.
Les identifiants sont uniques et tous les prerequis existent sans cycle.

## Validation

Une validation renvoie : statut, conditions reussies, conditions restantes,
message pedagogique et details techniques repliables. La simple recherche d'un
mot dans le code ne suffit pas pour valider un concept. Une analyse AST n'est
ajoutee que lorsqu'un test de comportement ou de type ne peut pas prouver la
competence visee.

Le formatage Prettier, les diagnostics TypeScript, les regles ESLint et les tests
fonctionnels sont quatre categories distinctes dans l'interface.

## Progression

Le schema stocke la version, la version du contenu, l'exercice actif, XP, badges,
exercices termines, progression par exercice, reglages et dates locales. Seuls
les fichiers modifies sont conserves lorsque possible.

Les donnees restaurees sont validees. Un etat corrompu ne fait jamais planter
l'application : le JSON brut reste exportable puis une reinitialisation est
proposee. Lors d'un changement de contenu incompatible, l'ancien code est
conserve avant de proposer le nouveau starter.

## Interface

- dashboard utilisable sur desktop et mobile ;
- IDE sombre en trois panneaux redimensionnables sur desktop ;
- onglets Cours, Code et Resultat sur petit ecran ;
- focus visible, labels, contrastes, clavier et `aria-live` ;
- aucune information transmise uniquement par la couleur ;
- animations discretes et respect de `prefers-reduced-motion` ;
- page de compatibilite claire plutot qu'une erreur technique brute.

## Qualite de code

- TypeScript strict, aucun `any` explicite dans le code produit ;
- composants et fonctions simples, responsabilites nettes ;
- pas d'abstraction speculative ;
- donnees derivees calculees plutot que dupliquees dans le state ;
- commentaires reserves aux decisions non evidentes ;
- contenu et metadonnees valides par schema ;
- dependances et scripts reproductibles avec pnpm.

## Definition of Done

Un jalon est termine lorsque son implementation, ses tests, sa documentation et
son entree dans `SUIVI.md` sont a jour. La V1 n'est livree qu'apres succes de :
lint, typecheck, tests unitaires, tests de composants, validation de contenu,
build de production et parcours Playwright critique.

Les controles VPS, HTTPS, Docker, Caddy et `crossOriginIsolated` sont realises
par l'agent de deploiement et ne sont jamais declares valides depuis le poste de
developpement.
