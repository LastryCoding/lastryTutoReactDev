---
type: tutorial
template: react
focus: /src/App.tsx
mainCommand: ['npm run dev -- --host 0.0.0.0', 'Lancement de React']
prepareCommands:
  - ['npm ci', 'Installation de l atelier']
previews:
  - [5173, 'Resultat']
filesystem:
  watch:
    - /src/**/*
terminal:
  open: false
  panels:
    - ['output', 'Serveur Vite']
    - type: terminal
      id: react-quest-terminal
      title: Console
      allowCommands:
        - npm
        - npx
        - node
i18n:
  partTemplate: 'Monde ${index} : ${title}'
  webcontainerLinkText: Propulse par WebContainers
  startWebContainerText: Demarrer l atelier
  noPreviewNorStepsText: Aucun resultat a afficher
  filesTitleText: Fichiers
  confirmationText: Confirmer
  prepareEnvironmentTitleText: Preparation de l atelier
  defaultPreviewTitleText: Resultat
  reloadPreviewTitle: Recharger le resultat
  toggleTerminalButtonText: Afficher ou masquer la console
  solveButtonText: Voir la solution
  resetButtonText: Reinitialiser
openInStackBlitz: false
downloadAsZip: false
meta:
  title: React Quest
  description: Apprenez TypeScript et React avec des exercices interactifs.
---
