import { useState } from 'react';

function useOnlineStatus() {
  const [online] = useState(true);
  // TODO : abonne l'état aux événements online et offline.
  return online;
}

export default function App() { return <p>{useOnlineStatus() ? 'En ligne' : 'Hors ligne'}</p>; }
