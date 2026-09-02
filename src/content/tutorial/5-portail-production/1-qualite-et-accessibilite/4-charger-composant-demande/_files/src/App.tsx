import { Suspense } from 'react';

// TODO : crée un composant lazy qui affiche Rapport prêt.
function Report() { return <p>Rapport indisponible</p>; }
export default function App() { return <Suspense fallback={<p>Chargement...</p>}><Report /></Suspense>; }
