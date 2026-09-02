import { useState } from 'react';

export default function App() {
  const [items, setItems] = useState(['Carte']);
  // TODO : crée un nouveau tableau contenant aussi Potion.
  return <><button>Ajouter une potion</button><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></>;
}
