# Suivi d'execution

Derniere mise a jour : 2026-09-02.

Ce fichier consigne uniquement des faits observes. `Verifie` signifie qu'une
commande ou un controle reproductible a reussi. `Prevu` ne constitue jamais une
preuve de fonctionnement.

## Etat courant

- Phase locale terminee : RQ-16 Publication V1.
- Depot GitHub : `https://github.com/LastryCoding/lastryTutoReactDev`.
- Visibilite GitHub : publique, verifiee via l'API GitHub.
- Depot local : vide au demarrage, sans commit, branche initiale `master`.
- Remote local : `lastry`, URL HTTPS du depot public.
- DNS : `reactquest.lastry.fr` resout vers `62.169.27.147` au 2026-09-01.
- VPS : volontairement hors perimetre de cet agent de developpement.
- Deploiement : sera realise par un agent distinct sur le VPS.

## Audit des outils locaux

| Outil      | Resultat           | Statut        |
| ---------- | ------------------ | ------------- |
| Node.js    | `v24.19.0`         | Verifie       |
| npm        | `11.17.0`          | Verifie       |
| pnpm       | `10.15.0`          | Verifie       |
| Git        | `2.49.0.windows.1` | Verifie       |
| GitHub CLI | non installe       | Limite connue |

L'absence de GitHub CLI n'empeche pas un push Git : la capacite de push HTTPS
vers le remote `lastry` est verifiee.

## Versions verrouillees

- TutorialKit : `1.6.0`.
- Astro : `4.16.19`.
- React et React DOM : `18.3.1`.
- TypeScript : `5.9.3`.
- ESLint : `10.9.1`.
- Prettier : `3.9.6`.
- Vitest : `3.2.7`.
- Playwright : `1.62.1`.
- Vite du template WebContainer : `6.4.3`.

Decision : demarrer avec la matrice TutorialKit supportee et n'ajouter une API
WebContainer directe que si une limitation bloquante est reproduite.

## Dette de dependances

`pnpm audit` remonte 4 alertes faibles, 12 moderees et 5 elevees dans la chaine
de developpement historique Astro 4/Vite 5 de TutorialKit. Les correctifs Astro
requis commencent en version majeure 6 ou 7, hors de la peer dependency
TutorialKit `^4.15.0`. Le site produit est statique, ne livre pas `node_modules`
et ne traite aucune donnee distante au build, ce qui neutralise les vecteurs SSR
signales sans faire disparaitre la dette de supply chain.

Le template React execute dans WebContainers utilise Vite `6.4.3` et son
`npm audit` retourne zero vulnerabilite.

## Journal

### 2026-09-01 - Demarrage

- depot public et vide confirme ;
- DNS cible deja configure ;
- perimetre ajuste : construction, tests, documentation et push local ;
- audit et modifications VPS delegues a un autre agent ;
- volume valide avec le commanditaire : 44 exercices principaux ;
- creation de la source de verite documentaire en cours.
- README, vision, bible, architecture, roadmap et suivi crees puis relus.

### 2026-09-02 - RQ-01 Initialisation technique

- projet TutorialKit `1.6.0` initialise avec Astro 4 et React 18 ;
- dependances racine et template d'exercice verrouillees ;
- telemetrie Astro desactivee dans les scripts ;
- premier template React strict et premiere lecon structures ;
- `pnpm lint` : succes ;
- `pnpm typecheck` : 0 erreur, 0 avertissement, 0 hint ;
- `pnpm validate:content` : 1 lecon structurellement valide ;
- `pnpm test` : succes, aucun test applicatif attendu a ce jalon ;
- `pnpm build` : succes, 2 pages statiques generees ;
- serveur local : `/` et la premiere lecon ont repondu HTTP 200 ;
- template : lint et typecheck reussis ;
- template : audit npm sans vulnerabilite ;
- avertissement de bundle TutorialKit superieur a 500 ko observe et conserve
  comme axe de mesure, sans chargement du WebContainer sur un futur dashboard.

### 2026-09-02 - RQ-02 Spike vertical

- API `tutorialkit:store` utilisee pour les documents, snapshots, reset et solution ;
- API `tutorialkit:core` utilisee pour TypeScript, ESLint et Vitest ;
- code modifie sauvegarde avec debounce dans `reactquest:state:v1` ;
- seuls les fichiers differents du starter sont stockes ;
- code restaure apres rechargement avant la reprise des modifications ;
- formatage realise par `prettier/standalone`, charge paresseusement ;
- readiness basee sur la preview TutorialKit, donc apres `npm ci` et Vite ;
- validation structuree en trois conditions avec details techniques ;
- solution et reset natifs TutorialKit interceptes pour la tracabilite locale ;
- XP idempotent et badge `premier-pas` testes ;
- changement de version de contenu avec archivage de l'ancien code teste ;
- etat JSON corrompu isole sans plantage et migration v0 testee ;
- `pnpm test` : 5 tests passes dans 2 fichiers ;
- `pnpm validate:exercises` : starter en echec et solution valide ;
- `pnpm test:e2e` sur Microsoft Edge : 1 test passe en 1,9 minute ;
- E2E verifie COOP/COEP local via `crossOriginIsolated === true` ;
- E2E verifie edition, preview, echec du starter, autosauvegarde, rechargement,
  restauration, formatage, execution, validation et attribution de 50 XP.

### 2026-09-02 - RQ-06 a RQ-12 Parcours complet

- 44 missions principales reparties par monde selon `4 / 8 / 8 / 9 / 7 / 8` ;
- 8 missions bonus livrees sans bloquer le parcours principal ;
- chaque lecon possede ses metadonnees, son starter, sa solution et un template
  de validation comportementale dedie ;
- graphe des prerequis, ordres, durees, XP et versions controles globalement ;
- `pnpm format:check` : succes ;
- `pnpm lint` : succes ;
- `pnpm test` : 5 tests passes dans 2 fichiers ;
- `pnpm validate:content` : 52 lecons valides, dont 44 principales et 8 bonus ;
- `pnpm validate:exercises` : 52 starters types en echec comportemental et 52
  solutions typees, lintees et valides.

### 2026-09-02 - RQ-15 CI et livraison statique

- workflow GitHub Actions limite aux permissions de lecture et controles de
  qualite alignes avec la validation locale ;
- Dockerfile multi-stage : build Node/pnpm puis fichiers statiques uniquement ;
- nginx non privilegie, lance sous l'identite `101:101` sur le port `8080` ;
- Compose sans port hote, capacites supprimees, racine en lecture seule et
  reseau Caddy externe obligatoire ;
- healthcheck interne et page 404 statique dediee ;
- configuration Caddy documentee avec COOP et COEP pour WebContainers ;
- `docker compose config --quiet` avec `CADDY_NETWORK=caddy` : succes ;
- construction de l'image depuis zero : succes, 53 pages statiques generees ;
- conteneur de verification : etat `healthy`, accueil HTTP 200, route inconnue
  HTTP 404 et endpoint `/healthz` egal a `healthy` ;
- deploiement, exploitation et rollback documentes dans `docs/DEPLOYMENT.md`.

### 2026-09-02 - RQ-03 Domaine et stockage local

- schema Zod des preferences expose et mise a jour immutable validee ;
- export JSON de la progression complete depuis chaque exercice ;
- import depuis un fichier avec migration et validation avant toute ecriture ;
- un import invalide conserve sans modification la progression courante ;
- reinitialisation totale protegee par une confirmation explicite ;
- un etat principal illisible est archive sous `reactquest:state:corrupted`
  avant initialisation, reste telechargeable et peut etre supprime explicitement ;
- preferences de theme, taille de texte, mouvement et sprint modifiables ;
- gestion des donnees disponible meme lorsque WebContainers est incompatible ;
- `pnpm lint` : succes ;
- `pnpm typecheck` : 0 erreur, 0 avertissement, 0 hint ;
- `pnpm test` : 8 tests passes dans 2 fichiers ;
- `pnpm build` : succes, 52 exercices valides et 53 pages generees.

### 2026-09-02 - RQ-04 Dashboard et progression

- la racine `/` sert un dashboard Astro dedie au lieu d'une redirection ;
- aucune iframe ni initialisation WebContainer sur le dashboard ;
- carte responsive des six mondes avec progression et etat explicite ;
- prochaine mission et deblocage derives uniquement des prerequis termines ;
- XP, badges et acquis restitues depuis le store local ;
- mode sprint persiste et limite aux missions actuellement accessibles ;
- export, import, reset, preferences et recuperation accessibles depuis l'accueil ;
- 3 tests de domaine et 2 tests de composant couvrent la progression derivee ;
- Playwright dashboard : desktop et mobile valides sur Microsoft Edge.

### 2026-09-02 - RQ-05 et RQ-13 IDE et qualite transversale

- actions Executer, Verifier, Formater, Sauvegarder, Reinitialiser, Indice,
  Solution et Agrandir disponibles sur les 52 exercices ;
- diagnostics pedagogiques separes pour TypeScript, ESLint et comportement ;
- raccourcis clavier pour execution, verification, sauvegarde et formatage ;
- compatibilite WebContainers controlee avec alternative lisible ;
- dashboard responsive, focus visibles, labels, statuts textuels et `aria-live` ;
- `pnpm test` : 13 tests passes dans 4 fichiers, dont 2 tests de composant ;
- `pnpm test:e2e` : 3 tests passes en 2 minutes sur Microsoft Edge ;
- parcours Edge : isolation, edition, preview, echec, restauration, formatage,
  execution, succes, 50 XP, badge, acquis et prochaine mission verifies.

### 2026-09-02 - RQ-14 Documentation finale

- README aligne sur les six mondes effectivement livres ;
- guide auteur, architecture, contribution, confidentialite et deploiement a jour ;
- captures dashboard desktop et mobile generees avec Playwright et relues.

### 2026-09-02 - Validation de la candidate V1

- `pnpm format:check` : succes ;
- `pnpm lint` : succes ;
- `pnpm typecheck` : 0 erreur, 0 avertissement, 0 hint ;
- `pnpm test` : 13 tests passes dans 4 fichiers ;
- `pnpm build` : succes, 52 exercices valides et 53 pages generees ;
- `pnpm test:e2e` : 3 tests passes sur Microsoft Edge ;
- image Docker finale reconstruite depuis le depot : succes ;
- conteneur final : utilisateur `101:101`, etat `healthy`, accueil HTTP 200,
  dashboard present, endpoint de sante valide et route inconnue HTTP 404.

### 2026-09-02 - RQ-16 Publication V1

- historique inspecte et branche `main` synchronisee avec le remote `lastry` ;
- candidate V1 poussee dans le commit `2a8a6c3` ;
- depot public verifie via l'API GitHub ;
- workflow CI public `33583750712` termine avec la conclusion `success`.

## Prochaine porte

RQ-17 Deploiement VPS reste hors du poste local et reserve a l'agent dedie.
