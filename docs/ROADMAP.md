# Roadmap V1

Derniere mise a jour : 2026-09-02.

Les statuts autorises sont `A faire`, `En cours`, `Bloque` et `Termine`. Un jalon
ne passe a `Termine` qu'apres code, verification, documentation et commit.

| ID    | Jalon                             | Statut           | Porte de sortie                                                          |
| ----- | --------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| RQ-00 | Documentation et source de verite | Termine          | README, vision, bible, architecture, roadmap et suivi committes          |
| RQ-01 | Initialisation technique          | Termine          | App TutorialKit demarre, scripts qualite disponibles, build vert         |
| RQ-02 | Spike vertical                    | Termine          | Premier exercice complet restaure apres rechargement                     |
| RQ-03 | Domaine et stockage local         | Termine          | Store, migrations, import/export et corruption testes                    |
| RQ-04 | Dashboard et progression          | Termine          | Carte, XP, badges, acquis, sprint et deblocage fonctionnels              |
| RQ-05 | IDE React Quest                   | Termine          | Actions, panneaux, diagnostics, raccourcis et compatibilite fonctionnels |
| RQ-06 | Monde 0                           | Termine          | 4 starters, solutions et validations vertes                              |
| RQ-07 | Monde 1                           | Termine          | 8 starters, solutions et validations vertes                              |
| RQ-08 | Monde 2                           | Termine          | 8 starters, solutions et validations vertes                              |
| RQ-09 | Monde 3                           | Termine          | 9 starters, solutions et validations vertes                              |
| RQ-10 | Monde 4                           | Termine          | 7 starters, solutions et validations vertes                              |
| RQ-11 | Monde 5                           | Termine          | Job Tracker en 8 niveaux et validation finale verte                      |
| RQ-12 | Monde bonus                       | Termine          | Exercices bonus livres sans bloquer le parcours principal                |
| RQ-13 | Qualite transversale              | Termine          | A11y, responsive, unitaires, composants et Playwright verts              |
| RQ-14 | Documentation finale              | Termine          | Guides exercice, architecture, confidentialite et captures a jour        |
| RQ-15 | CI et livraison statique          | Termine          | Workflow, Docker, Compose et exemples de deploiement valides             |
| RQ-16 | Publication V1                    | Termine          | Historique inspecte, `main` pousse, depot public et CI verifies          |
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
- 2026-09-02 : RQ-02 termine, tranche verticale validee de bout en bout sur Edge.
- 2026-09-02 : RQ-03 termine, cycle complet des donnees locales valide.
- 2026-09-02 : RQ-04, RQ-05 et RQ-13 termines, produit et parcours Edge valides.
- 2026-09-02 : RQ-06 a RQ-12 termines, 44 missions et 8 bonus valides.
- 2026-09-02 : RQ-14 termine, documentation et captures finales alignees.
- 2026-09-02 : RQ-15 termine, CI et image nginx non privilegiee validees.
- 2026-09-02 : RQ-16 termine, candidate V1 poussee et CI publique verte.
