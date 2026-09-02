import { useState } from 'react';

export default function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  // TODO : recopie query dans result après 300 ms et nettoie le timer.
  return <><label>Recherche <input value={query} onChange={(event) => setQuery(event.target.value)} /></label><p>Résultat : {result}</p></>;
}
