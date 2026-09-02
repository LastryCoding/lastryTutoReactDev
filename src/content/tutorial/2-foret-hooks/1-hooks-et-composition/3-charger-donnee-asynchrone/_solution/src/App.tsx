import { useEffect, useState } from 'react';

const loadItem = () => Promise.resolve('Boussole');

export default function App() {
  const [item, setItem] = useState<string | null>(null);
  useEffect(() => { void loadItem().then(setItem); }, []);
  return <p>{item ?? 'Chargement...'}</p>;
}
