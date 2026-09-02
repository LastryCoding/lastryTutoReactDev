import { useState, type ReactNode } from 'react';

function Counter({ children }: { children: (count: number) => ReactNode }) {
  const [count, setCount] = useState(0);
  // TODO : appelle children avec count après le bouton.
  return <button onClick={() => setCount((value) => value + 1)}>Ajouter</button>;
}
export default function App() { return <Counter>{(count) => <p>Total : {count}</p>}</Counter>; }
