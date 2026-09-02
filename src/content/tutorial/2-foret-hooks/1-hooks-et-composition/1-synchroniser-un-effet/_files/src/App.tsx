import { useState } from 'react';

export default function App() {
  const [zone, setZone] = useState('Clairière');
  // TODO : synchronise document.title avec zone dans un effet.
  return <label>Zone <input value={zone} onChange={(event) => setZone(event.target.value)} /></label>;
}
