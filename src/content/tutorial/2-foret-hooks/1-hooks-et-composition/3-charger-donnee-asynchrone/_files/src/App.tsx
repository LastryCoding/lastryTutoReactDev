import { useState } from 'react';

const loadItem = () => Promise.resolve('Boussole');

export default function App() {
  const [item, setItem] = useState<string | null>(null);
  // TODO : appelle loadItem dans un effet puis stocke sa réponse.
  return <p>{item ?? 'Chargement...'}</p>;
}
