import { useEffect, useState } from 'react';

export default function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  useEffect(() => { const timer = window.setTimeout(() => setResult(query), 300); return () => window.clearTimeout(timer); }, [query]);
  return <><label>Recherche <input value={query} onChange={(event) => setQuery(event.target.value)} /></label><p>Résultat : {result}</p></>;
}
