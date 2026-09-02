import { useState } from 'react';

export default function App() {
  const [items, setItems] = useState(['Carte']);
  return <><button onClick={() => setItems((current) => [...current, 'Potion'])}>Ajouter une potion</button><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></>;
}
