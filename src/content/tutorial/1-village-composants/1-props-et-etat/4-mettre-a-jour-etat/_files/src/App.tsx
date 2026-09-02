import { useState } from 'react';

export default function App() {
  const [crystals, setCrystals] = useState(0);
  // TODO : appelle setCrystals avec la valeur précédente au clic.
  return <button>Cristaux : {crystals}</button>;
}
