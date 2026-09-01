# Roadmap V1

Derniere mise a jour : 2026-09-02.

Les statuts autorises sont `A faire`, `En cours`, `Bloque` et `Termine`. Un jalon
ne passe a `Termine` qu'apres code, verification, documentation et commit.

| ID    | Jalon                             | Statut           | Porte de sortie                                                          |
| ----- | --------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| RQ-00 | Documentation et source de verite | Termine          | README, vision, bible, architecture, roadmap et suivi committes          |
| RQ-01 | Initialisation technique          | Termine          | App TutorialKit demarre, scripts qualite disponibles, build vert         |
| RQ-02 | Spike vertical                    | A faire          | Premier exercice complet restaure apres rechargement                     |
| RQ-03 | Domaine et stockage local         | A faire          | Store, migrations, import/export et corruption testes                    |
| RQ-04 | Dashboard et progression          | A faire          | Carte, XP, badges, acquis, sprint et deblocage fonctionnels              |
| RQ-05 | IDE React Quest                   | A faire          | Actions, panneaux, diagnostics, raccourcis et compatibilite fonctionnels |
| RQ-06 | Monde 0                           | A faire          | 4 starters, solutions et validations vertes                              |
| RQ-07 | Monde 1                           | A faire          | 8 starters, solutions et validations vertes                              |
| RQ-08 | Monde 2                           | A faire          | 8 starters, solutions et validations vertes                              |
| RQ-09 | Monde 3                           | A faire          | 9 starters, solutions et validations vertes                              |
| RQ-10 | Monde 4                           | A faire          | 7 starters, solutions et validations vertes                              |
| RQ-11 | Monde 5                           | A faire          | Job Tracker en 8 niveaux et validation finale verte                      |
| RQ-12 | Monde bonus                       | A faire          | Exercices bonus livres sans bloquer le parcours principal                |
| RQ-13 | Qualite transversale              | A faire          | A11y, responsive, unitaires, composants et Playwright verts              |
| RQ-14 | Documentation finale              | A faire          | Guides exercice, architecture, confidentialite et captures a jour        |
| RQ-15 | CI et livraison statique          | A faire          | Workflow, Docker, Compose et exemples de deploiement valides             |
| RQ-16 | Publication V1                    | A faire          | Historique inspecte, `main` pousse, depot public et CI verifies          |
| RQ-17 | Deploiement VPS                   | Hors poste local | A realiser et verifier par l'agent VPS                                   |

## Strategie de livraison

Le spike RQ-02 est une porte ferme : aucun lot massif de contenu n'est produit
tant que l'editeur, la preview, le formatage, les diagnostics, la validation et
la restauration locale ne fonctionnent pas ensemble.

Les mondes sont ensuite livres par lots autonomes. Chaque lot met a jour les
metadonnees, le contenu, les tests et le suivi dans le meme commit fonctionnel.

## Strategie Git

- branche de reference : `main` ;
- un commit par jalon ou lot fonctionnel coherent ;
- aucun commit de secret ou de fichier d'environnement sensible ;
- pas de commit marque comme termine avec des tests rouges ;
- la documentation d'avancement fait partie de chaque commit.

## Historique des jalons

- 2026-09-01 : RQ-00 termine, six documents fondateurs crees et relus.
- 2026-09-02 : RQ-01 termine, socle TutorialKit compile et servi localement.
