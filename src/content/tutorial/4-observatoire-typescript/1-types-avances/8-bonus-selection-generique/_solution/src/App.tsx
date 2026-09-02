import { useState } from 'react';

function useSelection<T>(initial: T) {
  return useState<T>(initial);
}
export default function App() { const [rune, select] = useSelection('Lune'); return <button onClick={() => select('Soleil')}>{rune}</button>; }
