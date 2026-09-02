# Format des exercices

Ce document decrit le contrat V1 confirme par le spike TutorialKit. Un exercice
qui ne respecte pas ce contrat fait echouer `pnpm validate:content` ou
`pnpm validate:exercises`.

## Arborescence

```text
src/content/tutorial/<monde>/<chapitre>/<exercice>/
  content.mdx
  _files/
    src/App.tsx
  _solution/
    src/App.tsx
```

TutorialKit fusionne `_files` avec un template propre a l'exercice, qui etend
`src/templates/react`. Les tests dedies restent masques dans l'editeur mais sont
executes dans WebContainers. `_solution` remplace les fichiers modifies lorsque
la solution est revelee.

## Metadonnees

Les champs React Quest sont places sous `custom`, car le schema TutorialKit
refuse les proprietes metier a la racine.

```yaml
---
type: lesson
title: Modifier un premier composant
slug: modifier-un-texte
template: camp-01
focus: /src/App.tsx
custom:
  id: camp-01
  world: 0
  order: 1
  prerequisites: []
  estimatedMinutes: 10
  xp: 50
  difficulty: initiation
  concepts:
    - JSX
  contentVersion: 1
  bonus: false
---
```

Le parcours V1 compte 52 exercices : 44 missions principales et 8 bonus.
`contentVersion` est incremente quand un changement rend l'ancien code
incompatible. React Quest archive alors les fichiers modifies avant de charger
le nouveau starter.

## Contenu pedagogique

Chaque `content.mdx` contient :

1. une introduction courte ;
2. un objectif concret ;
3. les etapes ;
4. les notions utilisees ;
5. le resultat attendu ;
6. le composant `ExerciseActions` avec trois indices progressifs ;
7. un recapitulatif de reussite.

Les commentaires TODO sont places directement dans les fichiers `_files`. Les
noms de variables, fonctions, types et composants restent en anglais.

## Validation

Le bouton Verifier execute dans WebContainers :

1. `npm run typecheck` ;
2. `npm run lint` ;
3. `npm run test`.

Le resultat distingue TypeScript, ESLint et test fonctionnel. Il contient les
conditions reussies, les conditions restantes, un message pedagogique et les
sorties techniques repliables.

Le validateur global resout le template dedie de chaque exercice, copie chaque
variante dans un projet temporaire commun et exige :

- un code de sortie non nul pour `_files` ;
- un code de sortie nul pour `_solution`.

Le starter ne doit pas echouer uniquement a cause d'une infrastructure cassee.
Il doit compiler autant que possible et echouer sur la competence visee. La
solution doit passer TypeScript, ESLint et les tests.

## Commandes auteur

```bash
pnpm validate:content
pnpm validate:exercises
pnpm test:e2e
```

`validate:exercises` installe une seule fois le template dans un dossier
temporaire, preserve `node_modules`, puis remonte chaque starter et chaque
solution. Le dossier temporaire est toujours supprime en fin d'execution.

## Checklist auteur

- identifiant et slug uniques ;
- prerequis existants et sans cycle ;
- duree comprise entre 10 et 20 minutes ;
- XP coherent avec la difficulte ;
- starter et solution differents ;
- commentaires TODO presents dans le starter ;
- trois indices maximum, du concept vers le pseudo-code ;
- aucun `any` explicite encourage ;
- message d'echec oriente vers une action ;
- starter en echec et solution validee automatiquement.
