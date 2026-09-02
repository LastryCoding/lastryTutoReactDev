import { useState } from 'react';

export default function App() {
  const [crystals, setCrystals] = useState(0);
  return <button onClick={() => setCrystals((value) => value + 1)}>Cristaux : {crystals}</button>;
}
