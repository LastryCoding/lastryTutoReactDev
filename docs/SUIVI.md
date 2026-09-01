# Suivi d'execution

Derniere mise a jour : 2026-09-02.

Ce fichier consigne uniquement des faits observes. `Verifie` signifie qu'une
commande ou un controle reproductible a reussi. `Prevu` ne constitue jamais une
preuve de fonctionnement.

## Etat courant

- Phase active : RQ-02 Spike vertical.
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

L'absence de GitHub CLI n'empeche pas un push Git si les identifiants HTTPS sont
disponibles. La capacite de push n'est pas encore verifiee.

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

## Prochaine porte

Realiser le spike RQ-02 : persistance du code, formatage, diagnostics, lint,
execution, preview, verification, XP et restauration apres rechargement.
