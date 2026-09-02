import { lazy, Suspense } from 'react';

const Report = lazy(() => Promise.resolve({ default: () => <p>Rapport prêt</p> }));
export default function App() { return <Suspense fallback={<p>Chargement...</p>}><Report /></Suspense>; }
