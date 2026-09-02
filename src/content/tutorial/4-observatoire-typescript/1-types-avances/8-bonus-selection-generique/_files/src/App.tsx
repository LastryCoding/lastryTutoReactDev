import { useState } from 'react';

function useSelection<T>(initial: T) {
  const [selected] = useState(initial);
  // TODO : expose selected et son setter typé.
  return [selected, (_next: T) => undefined] as const;
}
export default function App() { const [rune, select] = useSelection('Lune'); return <button onClick={() => select('Soleil')}>{rune}</button>; }
