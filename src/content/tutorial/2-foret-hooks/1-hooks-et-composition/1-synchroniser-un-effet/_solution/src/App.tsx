import { useEffect, useState } from 'react';

export default function App() {
  const [zone, setZone] = useState('Clairière');
  useEffect(() => { document.title = zone; }, [zone]);
  return <label>Zone <input value={zone} onChange={(event) => setZone(event.target.value)} /></label>;
}
